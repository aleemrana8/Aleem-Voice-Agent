"""
Appointment business-logic service layer.

Single source of truth for appointment CRUD, slot generation,
conflict detection, and notification dispatch.  Shared by REST routes
and the voice-agent pipeline.
"""

from datetime import date as date_type, datetime, timezone
from typing import Dict, List, Optional, Tuple

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from loguru import logger

from app.models.appointment import Appointment
from app.models.doctor import Doctor, DoctorAvailability
from app.models.enums import AppointmentStatus, NotificationType
from app.models.notification import Notification
from app.models.patient import Patient
from app.schemas.appointment import (
    AppointmentDetail,
    AppointmentListItem,
    AppointmentStatsResponse,
    AvailabilityResponse,
    TimeSlot,
)
from app.services.websocket_manager import ws_manager
from app.services.ehr_service import ehr_service
from app.services.audit_service import audit_service


class AppointmentService:
    """Encapsulates every appointment operation behind an async API."""

    # ────────────────────────────────────────────────
    #  Book
    # ────────────────────────────────────────────────
    async def book(
        self,
        patient_id: str,
        doctor_id: str,
        appt_date: str,
        time_slot: str,
        duration: int = 30,
        reason: Optional[str] = None,
        booked_via: str = "dashboard",
        call_id: Optional[str] = None,
        location: Optional[str] = None,
    ) -> Appointment:
        """Create a new appointment after validating patient, doctor, and slot."""

        patient = await self._require_patient(patient_id)
        doctor = await self._require_doctor(doctor_id)

        # Validate the slot is within the doctor's schedule
        await self._validate_slot_in_schedule(doctor, appt_date, time_slot)

        # Conflict check (uses compound index)
        if await Appointment.has_conflict(doctor_id, appt_date, time_slot):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Time slot {time_slot} on {appt_date} is already booked for Dr. {doctor.full_name}",
            )

        appt = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            patient_name=patient.full_name,
            doctor_name=doctor.full_name,
            date=appt_date,
            time_slot=time_slot,
            duration=duration,
            reason=reason,
            booked_via=booked_via,
            call_id=call_id,
            location=location,
        )
        await appt.insert()

        logger.info(
            "Appointment booked | appt={} patient={} doctor={} date={} slot={}",
            appt.appointment_id,
            patient.full_name,
            doctor.full_name,
            appt_date,
            time_slot,
        )

        await self._notify(
            "New Appointment",
            f"{patient.full_name} booked with Dr. {doctor.full_name} on {appt_date} at {time_slot}",
            NotificationType.SUCCESS,
        )
        await self._broadcast("appointment_created", appt)

        # EHR Integration sync
        try:
            await ehr_service.sync_appointment_created(appt)
        except Exception as exc:
            logger.warning("EHR sync failed for appointment {}: {}", appt.appointment_id, exc)

        # Audit log
        try:
            await audit_service.log_appointment_booked(
                appt.appointment_id, patient_id, doctor_id, booked_via, call_id
            )
        except Exception:
            pass

        return appt

    # ────────────────────────────────────────────────
    #  Reschedule
    # ────────────────────────────────────────────────
    async def reschedule(
        self,
        appointment_id: str,
        new_date: str,
        new_time_slot: str,
        reason: Optional[str] = None,
    ) -> Appointment:
        """Move an existing appointment to a new date/time."""

        appt = await self._require_appointment(appointment_id)

        if appt.status in (
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reschedule an appointment with status '{appt.status.value}'",
            )

        doctor = await self._require_doctor(appt.doctor_id)
        await self._validate_slot_in_schedule(doctor, new_date, new_time_slot)

        if await Appointment.has_conflict(
            appt.doctor_id, new_date, new_time_slot, exclude_id=str(appt.id)
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Time slot {new_time_slot} on {new_date} is already booked",
            )

        old_date, old_slot = appt.date, appt.time_slot
        appt.date = new_date
        appt.time_slot = new_time_slot
        appt.status = AppointmentStatus.RESCHEDULED
        if reason:
            appt.notes = reason
        await appt.save()

        logger.info(
            "Appointment rescheduled | appt={} from={}/{} to={}/{}",
            appt.appointment_id,
            old_date,
            old_slot,
            new_date,
            new_time_slot,
        )

        await self._notify(
            "Appointment Rescheduled",
            f"{appt.patient_name}'s appointment moved to {new_date} at {new_time_slot}",
            NotificationType.WARNING,
        )
        await self._broadcast("appointment_rescheduled", appt)

        # EHR Integration sync
        try:
            await ehr_service.sync_appointment_rescheduled(appt)
        except Exception as exc:
            logger.warning("EHR sync failed for reschedule {}: {}", appt.appointment_id, exc)

        # Audit log
        try:
            await audit_service.log_appointment_rescheduled(
                appt.appointment_id, old_date, old_slot, new_date, new_time_slot
            )
        except Exception:
            pass

        return appt

    # ────────────────────────────────────────────────
    #  Cancel
    # ────────────────────────────────────────────────
    async def cancel(
        self,
        appointment_id: str,
        reason: Optional[str] = None,
        cancelled_by: Optional[str] = None,
    ) -> Appointment:
        """Cancel an active appointment."""

        appt = await self._require_appointment(appointment_id)

        if appt.status == AppointmentStatus.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Appointment is already cancelled",
            )
        if appt.status == AppointmentStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel a completed appointment",
            )

        appt.status = AppointmentStatus.CANCELLED
        appt.cancelled_at = datetime.now(timezone.utc)
        appt.cancelled_by = cancelled_by
        if reason:
            appt.notes = reason
        await appt.save()

        logger.info("Appointment cancelled | appt={}", appt.appointment_id)

        await self._notify(
            "Appointment Cancelled",
            f"{appt.patient_name}'s appointment on {appt.date} at {appt.time_slot} has been cancelled",
            NotificationType.ERROR,
        )
        await self._broadcast("appointment_cancelled", appt)

        # EHR Integration sync
        try:
            await ehr_service.sync_appointment_cancelled(appt)
        except Exception as exc:
            logger.warning("EHR sync failed for cancellation {}: {}", appt.appointment_id, exc)

        # Audit log
        try:
            await audit_service.log_appointment_cancelled(
                appt.appointment_id, reason or "", cancelled_by
            )
        except Exception:
            pass

        return appt

    # ────────────────────────────────────────────────
    #  Doctor Availability
    # ────────────────────────────────────────────────
    async def get_availability(
        self, doctor_id: str, target_date: str
    ) -> AvailabilityResponse:
        """
        Return every time slot for a doctor on *target_date* together with
        its booking state.  Respects DoctorAvailability overrides (blocked
        days, blocked slots, modified hours) and break times.
        """
        doctor = await self._require_doctor(doctor_id)

        dt = datetime.strptime(target_date, "%Y-%m-%d")
        day_name = dt.strftime("%A").lower()

        # Check for date-specific override
        override = await DoctorAvailability.find_one(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.date == target_date,
        )

        # Doctor marked unavailable for this date
        if override and not override.is_available:
            return AvailabilityResponse(
                doctor_id=doctor_id,
                doctor_name=doctor.full_name,
                date=target_date,
                day=day_name,
                is_working_day=False,
                has_override=True,
                message=override.reason or f"Doctor is not available on {target_date}",
            )

        # Determine working hours and breaks (override or weekly schedule)
        breaks = []
        if override and override.override_start and override.override_end:
            start_str, end_str = override.override_start, override.override_end
            slot_duration = (
                doctor.schedule[day_name].slot_duration
                if day_name in doctor.schedule
                else 30
            )
            has_override = True
            breaks = (
                override.override_breaks
                if override.override_breaks
                else (doctor.schedule[day_name].breaks if day_name in doctor.schedule else [])
            )
        elif day_name in doctor.schedule:
            sched = doctor.schedule[day_name]
            start_str, end_str = sched.start, sched.end
            slot_duration = sched.slot_duration
            breaks = sched.breaks
            has_override = bool(override)
        else:
            return AvailabilityResponse(
                doctor_id=doctor_id,
                doctor_name=doctor.full_name,
                date=target_date,
                day=day_name,
                is_working_day=False,
                has_override=bool(override),
                message=f"Doctor does not work on {day_name}s",
            )

        # Generate all slots
        all_slots = self._generate_slots(start_str, end_str, slot_duration)

        # Build break ranges for exclusion
        break_ranges = [
            (self._time_to_minutes(b.start), self._time_to_minutes(b.end))
            for b in breaks
        ]

        # Remove blocked slots from override
        blocked_set: set = set()
        if override and override.blocked_slots:
            blocked_set = set(override.blocked_slots)

        # Fetch booked slots from DB
        booked_appts = await Appointment.find(
            Appointment.doctor_id == doctor_id,
            Appointment.date == target_date,
            {"status": {"$in": [
                AppointmentStatus.SCHEDULED.value,
                AppointmentStatus.CONFIRMED.value,
            ]}},
        ).to_list()
        booked_set = {a.time_slot for a in booked_appts}

        slots = []
        for s in all_slots:
            t_min = self._time_to_minutes(s)
            in_break = any(bs <= t_min < be for bs, be in break_ranges)
            in_blocked = s in blocked_set
            in_booked = s in booked_set
            available = not (in_break or in_blocked or in_booked)
            slots.append(TimeSlot(time=s, available=available))

        available_count = sum(1 for s in slots if s.available)
        return AvailabilityResponse(
            doctor_id=doctor_id,
            doctor_name=doctor.full_name,
            date=target_date,
            day=day_name,
            slots=slots,
            available_count=available_count,
            booked_count=len(booked_set),
            total_count=len(all_slots),
            is_working_day=True,
            has_override=has_override,
        )

    # ────────────────────────────────────────────────
    #  Get Single
    # ────────────────────────────────────────────────
    async def get_by_id(self, appointment_id: str) -> Appointment:
        """Fetch a single appointment by its MongoDB _id or appointment_id."""
        return await self._require_appointment(appointment_id)

    # ────────────────────────────────────────────────
    #  List / Filter
    # ────────────────────────────────────────────────
    async def list_appointments(
        self,
        *,
        patient_id: Optional[str] = None,
        doctor_id: Optional[str] = None,
        appt_status: Optional[AppointmentStatus] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Appointment], int]:
        """Return filtered appointments with total count for pagination."""

        query: Dict = {}
        if patient_id:
            query["patient_id"] = patient_id
        if doctor_id:
            query["doctor_id"] = doctor_id
        if appt_status:
            query["status"] = appt_status.value
        if date_from or date_to:
            date_filter: Dict = {}
            if date_from:
                date_filter["$gte"] = date_from
            if date_to:
                date_filter["$lte"] = date_to
            query["date"] = date_filter

        total = await Appointment.find(query).count()
        items = (
            await Appointment.find(query)
            .sort("-date", "-time_slot")
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        return items, total

    # ────────────────────────────────────────────────
    #  Patient Appointments
    # ────────────────────────────────────────────────
    async def get_patient_appointments(
        self,
        patient_id: str,
        *,
        upcoming_only: bool = False,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Appointment], int]:
        """Get appointments for a specific patient."""

        # Validate patient exists
        await self._require_patient(patient_id)

        query: Dict = {"patient_id": patient_id}
        if upcoming_only:
            today = date_type.today().isoformat()
            query["date"] = {"$gte": today}
            query["status"] = {
                "$in": [
                    AppointmentStatus.SCHEDULED.value,
                    AppointmentStatus.CONFIRMED.value,
                    AppointmentStatus.RESCHEDULED.value,
                ]
            }

        total = await Appointment.find(query).count()
        items = (
            await Appointment.find(query)
            .sort("-date", "-time_slot")
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        return items, total

    # ────────────────────────────────────────────────
    #  Appointment History
    # ────────────────────────────────────────────────
    async def get_history(
        self,
        *,
        patient_id: Optional[str] = None,
        doctor_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[Appointment], int]:
        """
        Past / terminal-state appointments (completed, cancelled, no_show).
        Optionally filtered by patient or doctor.
        """
        query: Dict = {
            "status": {
                "$in": [
                    AppointmentStatus.COMPLETED.value,
                    AppointmentStatus.CANCELLED.value,
                    AppointmentStatus.NO_SHOW.value,
                ]
            }
        }
        if patient_id:
            query["patient_id"] = patient_id
        if doctor_id:
            query["doctor_id"] = doctor_id

        total = await Appointment.find(query).count()
        items = (
            await Appointment.find(query)
            .sort("-date", "-time_slot")
            .skip(skip)
            .limit(limit)
            .to_list()
        )
        return items, total

    # ────────────────────────────────────────────────
    #  Stats
    # ────────────────────────────────────────────────
    async def get_stats(self) -> AppointmentStatsResponse:
        """Aggregate appointment statistics for the dashboard."""
        today = date_type.today().isoformat()

        total = await Appointment.count()
        scheduled = await Appointment.find({"status": AppointmentStatus.SCHEDULED.value}).count()
        confirmed = await Appointment.find({"status": AppointmentStatus.CONFIRMED.value}).count()
        completed = await Appointment.find({"status": AppointmentStatus.COMPLETED.value}).count()
        cancelled = await Appointment.find({"status": AppointmentStatus.CANCELLED.value}).count()
        rescheduled = await Appointment.find({"status": AppointmentStatus.RESCHEDULED.value}).count()
        no_show = await Appointment.find({"status": AppointmentStatus.NO_SHOW.value}).count()
        today_count = await Appointment.find({"date": today}).count()

        return AppointmentStatsResponse(
            total=total,
            scheduled=scheduled,
            confirmed=confirmed,
            completed=completed,
            cancelled=cancelled,
            rescheduled=rescheduled,
            no_show=no_show,
            today=today_count,
        )

    # ════════════════════════════════════════════════
    #  Private helpers
    # ════════════════════════════════════════════════

    @staticmethod
    async def _require_patient(patient_id: str) -> Patient:
        patient = await Patient.find_one(Patient.patient_id == patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient '{patient_id}' not found",
            )
        return patient

    @staticmethod
    async def _require_doctor(doctor_id: str) -> Doctor:
        doctor = await Doctor.find_one(Doctor.employee_id == doctor_id)
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doctor '{doctor_id}' not found",
            )
        if not doctor.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doctor '{doctor_id}' is no longer active",
            )
        return doctor

    @staticmethod
    async def _require_appointment(appointment_id: str) -> Appointment:
        """Lookup by MongoDB ObjectId first, fall back to appointment_id field."""
        appt = None
        try:
            appt = await Appointment.get(ObjectId(appointment_id))
        except (InvalidId, Exception):
            pass
        if not appt:
            appt = await Appointment.find_one(
                Appointment.appointment_id == appointment_id
            )
        if not appt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment '{appointment_id}' not found",
            )
        return appt

    @staticmethod
    async def _validate_slot_in_schedule(
        doctor: Doctor, appt_date: str, time_slot: str
    ) -> None:
        """Ensure the requested slot falls within the doctor's working hours
        and is not inside a break window."""
        dt = datetime.strptime(appt_date, "%Y-%m-%d")
        day_name = dt.strftime("%A").lower()

        # Check override first
        override = await DoctorAvailability.find_one(
            DoctorAvailability.doctor_id == doctor.employee_id,
            DoctorAvailability.date == appt_date,
        )
        if override:
            if not override.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Doctor is not available on {appt_date}",
                )
            if time_slot in (override.blocked_slots or []):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Time slot {time_slot} is blocked on {appt_date}",
                )

        if day_name not in doctor.schedule and not (
            override and override.override_start
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Doctor does not work on {day_name}s",
            )

        # Check break windows
        breaks = []
        if override and override.override_breaks:
            breaks = override.override_breaks
        elif day_name in doctor.schedule:
            breaks = doctor.schedule[day_name].breaks

        if breaks:
            slot_min = int(time_slot[:2]) * 60 + int(time_slot[3:])
            for brk in breaks:
                brk_start = int(brk.start[:2]) * 60 + int(brk.start[3:])
                brk_end = int(brk.end[:2]) * 60 + int(brk.end[3:])
                if brk_start <= slot_min < brk_end:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Time slot {time_slot} falls within {brk.label} break ({brk.start}-{brk.end})",
                    )

    @staticmethod
    def _time_to_minutes(t: str) -> int:
        """Convert HH:MM to minutes since midnight."""
        h, m = map(int, t.split(":"))
        return h * 60 + m

    @staticmethod
    def _generate_slots(
        start: str, end: str, slot_duration: int
    ) -> List[str]:
        """Generate HH:MM time slots between start and end.
        Handles midnight (00:00) as end-of-day (24:00)."""
        start_h, start_m = map(int, start.split(":"))
        end_h, end_m = map(int, end.split(":"))
        cur = start_h * 60 + start_m
        # Treat 00:00 as midnight (1440 minutes)
        end_min = end_h * 60 + end_m
        if end_min <= cur:
            end_min = 24 * 60  # midnight
        slots: List[str] = []
        while cur + slot_duration <= end_min:
            h, m = divmod(cur, 60)
            slots.append(f"{h:02d}:{m:02d}")
            cur += slot_duration
        return slots

    @staticmethod
    async def _notify(
        title: str, message: str, notif_type: NotificationType = NotificationType.INFO
    ) -> None:
        try:
            notif = Notification(title=title, message=message, type=notif_type)
            await notif.insert()
        except Exception as exc:
            logger.warning("Failed to create notification: {}", exc)

    @staticmethod
    async def _broadcast(event_type: str, appt: Appointment) -> None:
        try:
            await ws_manager.broadcast(
                {
                    "type": event_type,
                    "data": AppointmentDetail.from_doc(appt).model_dump(mode="json"),
                }
            )
        except Exception as exc:
            logger.warning("Failed to broadcast {}: {}", event_type, exc)


# Singleton
appointment_service = AppointmentService()
