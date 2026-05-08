"""
Appointment business-logic service layer.
Encapsulates appointment CRUD, slot validation, and notification dispatch
so that routes and the voice agent share the same logic.
"""

from datetime import datetime, timezone
from typing import List, Optional

from app.models.appointment import Appointment, AppointmentResponse
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.notification import Notification
from app.services.websocket_manager import ws_manager
from fastapi import HTTPException
from loguru import logger


class AppointmentService:
    # ── Create ──────────────────────────────────────
    async def create(
        self,
        patient_id: str,
        doctor_id: str,
        date: str,
        time_slot: str,
        duration: int = 30,
        reason: Optional[str] = None,
        booked_via: str = "dashboard",
        call_id: Optional[str] = None,
    ) -> Appointment:
        patient = await Patient.find_one(Patient.patient_id == patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        doctor = await Doctor.find_one(Doctor.employee_id == doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        # Slot conflict check
        existing = await Appointment.find_one(
            Appointment.doctor_id == doctor_id,
            Appointment.date == date,
            Appointment.time_slot == time_slot,
            Appointment.status.is_in(["scheduled", "confirmed"]),
        )
        if existing:
            raise HTTPException(status_code=409, detail="Time slot already booked")

        appt = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            patient_name=patient.full_name,
            doctor_name=doctor.full_name,
            date=date,
            time_slot=time_slot,
            duration=duration,
            reason=reason,
            booked_via=booked_via,
            call_id=call_id,
        )
        await appt.insert()

        logger.info(
            f"Appointment created: {patient.full_name} → {doctor.full_name} on {date} {time_slot}"
        )

        # Notification + broadcast
        await self._notify(
            "New Appointment",
            f"{patient.full_name} booked with {doctor.full_name} on {date} at {time_slot}",
            "success",
        )
        await ws_manager.broadcast(
            {
                "type": "appointment_created",
                "data": AppointmentResponse.from_doc(appt).model_dump(mode="json"),
            }
        )
        return appt

    # ── Reschedule ──────────────────────────────────
    async def reschedule(
        self,
        appointment_id: str,
        new_date: str,
        new_time_slot: str,
        reason: Optional[str] = None,
    ) -> Appointment:
        appt = await Appointment.get(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        if appt.status in ("cancelled", "completed"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot reschedule {appt.status} appointment",
            )

        # Slot conflict
        existing = await Appointment.find_one(
            Appointment.doctor_id == appt.doctor_id,
            Appointment.date == new_date,
            Appointment.time_slot == new_time_slot,
            Appointment.status.is_in(["scheduled", "confirmed"]),
        )
        if existing and str(existing.id) != appointment_id:
            raise HTTPException(status_code=409, detail="New time slot already booked")

        appt.date = new_date
        appt.time_slot = new_time_slot
        appt.status = "rescheduled"
        appt.notes = reason or appt.notes
        appt.updated_at = datetime.now(timezone.utc)
        await appt.save()

        logger.info(f"Appointment rescheduled: {appointment_id}")

        await self._notify(
            "Appointment Rescheduled",
            f"{appt.patient_name}'s appointment moved to {new_date} at {new_time_slot}",
            "warning",
        )
        await ws_manager.broadcast(
            {
                "type": "appointment_rescheduled",
                "data": AppointmentResponse.from_doc(appt).model_dump(mode="json"),
            }
        )
        return appt

    # ── Cancel ──────────────────────────────────────
    async def cancel(
        self,
        appointment_id: str,
        reason: Optional[str] = None,
    ) -> Appointment:
        appt = await Appointment.get(appointment_id)
        if not appt:
            raise HTTPException(status_code=404, detail="Appointment not found")
        if appt.status == "cancelled":
            raise HTTPException(status_code=400, detail="Already cancelled")

        appt.status = "cancelled"
        appt.notes = reason or "Cancelled"
        appt.updated_at = datetime.now(timezone.utc)
        await appt.save()

        logger.info(f"Appointment cancelled: {appointment_id}")

        await self._notify(
            "Appointment Cancelled",
            f"{appt.patient_name}'s appointment on {appt.date} has been cancelled",
            "error",
        )
        await ws_manager.broadcast(
            {
                "type": "appointment_cancelled",
                "data": AppointmentResponse.from_doc(appt).model_dump(mode="json"),
            }
        )
        return appt

    # ── Availability ────────────────────────────────
    async def check_availability(self, doctor_id: str, date: str) -> dict:
        doctor = await Doctor.find_one(Doctor.employee_id == doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        target_date = datetime.strptime(date, "%Y-%m-%d")
        day_name = target_date.strftime("%A").lower()

        if day_name not in doctor.schedule:
            return {
                "doctor": doctor.full_name,
                "date": date,
                "available_slots": [],
                "message": f"Doctor not available on {day_name}",
            }

        day_sched = doctor.schedule[day_name]
        all_slots: List[str] = []
        start_h, start_m = map(int, day_sched.start.split(":"))
        end_h, end_m = map(int, day_sched.end.split(":"))
        cur = start_h * 60 + start_m
        end = end_h * 60 + end_m
        while cur + day_sched.slot_duration <= end:
            h, m = divmod(cur, 60)
            all_slots.append(f"{h:02d}:{m:02d}")
            cur += day_sched.slot_duration

        booked = await Appointment.find(
            Appointment.doctor_id == doctor_id,
            Appointment.date == date,
            Appointment.status.is_in(["scheduled", "confirmed"]),
        ).to_list()
        booked_set = {a.time_slot for a in booked}
        available = [s for s in all_slots if s not in booked_set]

        return {
            "doctor": doctor.full_name,
            "date": date,
            "available_slots": available,
            "total_slots": len(all_slots),
            "booked_slots": len(booked_set),
        }

    # ── Internal helpers ────────────────────────────
    @staticmethod
    async def _notify(title: str, message: str, notif_type: str = "info"):
        notif = Notification(title=title, message=message, type=notif_type)
        await notif.insert()


# Singleton
appointment_service = AppointmentService()
