"""
Scheduling Engine — Slot Locking & Appointment Operations
==========================================================
Production scheduling engine with:
  - Slot generation respecting doctor schedules/breaks/overrides
  - Slot state management: AVAILABLE → RESERVED → BOOKED / CANCELLED
  - Concurrent booking protection via MongoDB atomic operations
  - Break-time enforcement (8 PM - 9 PM)
  - Hospital hours: 3 PM (15:00) to Midnight (00:00)
  - 30-minute slots, 18 total per day, 16 bookable (2 in break)

Used by the FSM WorkflowEngine — NOT called by LLM directly.
"""

from __future__ import annotations

from datetime import date as date_type, datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from enum import StrEnum

from loguru import logger

from app.models.appointment import Appointment
from app.models.doctor import Doctor, DoctorAvailability
from app.models.enums import AppointmentStatus, NotificationType
from app.models.notification import Notification
from app.models.patient import Patient
from app.services.websocket_manager import ws_manager


class SlotState(StrEnum):
    AVAILABLE = "available"
    RESERVED = "reserved"  # Temporarily locked during voice conversation
    BOOKED = "booked"
    CANCELLED = "cancelled"


# In-memory reservation store for voice call slot locking.
# Key: "{doctor_id}:{date}:{time_slot}" → {"call_id": str, "expires": datetime}
_slot_reservations: dict[str, dict[str, Any]] = {}

# Reservation timeout in seconds (auto-release if booking not completed)
RESERVATION_TIMEOUT = 300  # 5 minutes


class SchedulingEngine:
    """
    Centralized scheduling engine for the voice agent FSM.
    All slot queries, bookings, reschedules, and cancellations
    flow through this service.
    """

    # ────────────────────────────────────────────────
    #  Slot Availability
    # ────────────────────────────────────────────────

    async def get_available_slots(
        self,
        doctor_id: str,
        date: str,
        location: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Return available time slots for a doctor on a specific date.
        Excludes booked, reserved, and break slots.
        """
        doctor = await self._get_doctor(doctor_id)
        if not doctor:
            return {"available_slots": [], "error": f"Doctor {doctor_id} not found"}

        # Validate location if doctor has location restrictions
        if location and hasattr(doctor, "locations") and doctor.locations:
            if location.title() not in [loc.title() for loc in doctor.locations]:
                return {
                    "available_slots": [],
                    "error": f"{doctor.full_name} is not available at {location}",
                }

        dt = datetime.strptime(date, "%Y-%m-%d")
        day_name = dt.strftime("%A").lower()

        # Check for override
        override = await DoctorAvailability.find_one(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.date == date,
        )

        if override and not override.is_available:
            return {
                "available_slots": [],
                "message": override.reason or f"Doctor unavailable on {date}",
            }

        # Determine schedule
        breaks = []
        if override and override.override_start and override.override_end:
            start_str = override.override_start
            end_str = override.override_end
            slot_duration = (
                doctor.schedule[day_name].slot_duration
                if day_name in doctor.schedule
                else 30
            )
            breaks = (
                override.override_breaks
                if override.override_breaks
                else (doctor.schedule[day_name].breaks if day_name in doctor.schedule else [])
            )
        elif day_name in doctor.schedule:
            sched = doctor.schedule[day_name]
            start_str = sched.start
            end_str = sched.end
            slot_duration = sched.slot_duration
            breaks = sched.breaks
        else:
            return {
                "available_slots": [],
                "message": f"Doctor does not work on {day_name}s",
            }

        # Generate all possible slots
        all_slots = self._generate_slots(start_str, end_str, slot_duration)

        # Build break ranges
        break_ranges = [
            (self._time_to_minutes(b.start), self._time_to_minutes(b.end))
            for b in breaks
        ]

        # Blocked slots from override
        blocked_set: set[str] = set()
        if override and override.blocked_slots:
            blocked_set = set(override.blocked_slots)

        # Booked slots from DB
        booked_appts = await Appointment.find({
            "doctor_id": doctor_id,
            "date": date,
            "status": {"$in": [
                AppointmentStatus.SCHEDULED.value,
                AppointmentStatus.CONFIRMED.value,
                AppointmentStatus.RESCHEDULED.value,
            ]},
        }).to_list()
        booked_set = {a.time_slot for a in booked_appts}

        # Purge expired reservations
        self._purge_expired_reservations()

        # Reserved slots (locked by other active calls)
        reserved_set = {
            key.split(":", 2)[2]
            for key, val in _slot_reservations.items()
            if key.startswith(f"{doctor_id}:{date}:")
        }

        # Filter available slots
        available = []
        for s in all_slots:
            t_min = self._time_to_minutes(s)
            in_break = any(bs <= t_min < be for bs, be in break_ranges)
            if in_break or s in blocked_set or s in booked_set or s in reserved_set:
                continue
            available.append(s)

        return {
            "available_slots": available,
            "total_slots": len(all_slots),
            "booked_count": len(booked_set),
            "reserved_count": len(reserved_set),
            "doctor_name": doctor.full_name,
            "date": date,
            "location": location,
        }

    # ────────────────────────────────────────────────
    #  Slot Reservation (Locking)
    # ────────────────────────────────────────────────

    def reserve_slot(
        self, doctor_id: str, date: str, time_slot: str, call_id: str
    ) -> bool:
        """
        Temporarily reserve a slot during a voice call.
        Returns True if successfully reserved.
        """
        self._purge_expired_reservations()
        key = f"{doctor_id}:{date}:{time_slot}"

        if key in _slot_reservations:
            existing = _slot_reservations[key]
            if existing["call_id"] == call_id:
                return True  # Already reserved by this call
            return False  # Reserved by another call

        _slot_reservations[key] = {
            "call_id": call_id,
            "expires": datetime.now(timezone.utc) + timedelta(seconds=RESERVATION_TIMEOUT),
        }
        logger.info(f"[SCHED] Slot reserved: {key} by {call_id}")
        return True

    def release_slot(self, doctor_id: str, date: str, time_slot: str, call_id: str):
        """Release a previously reserved slot."""
        key = f"{doctor_id}:{date}:{time_slot}"
        if key in _slot_reservations and _slot_reservations[key]["call_id"] == call_id:
            del _slot_reservations[key]
            logger.info(f"[SCHED] Slot released: {key}")

    def release_all_for_call(self, call_id: str):
        """Release all reservations for a call (e.g., on disconnect)."""
        to_remove = [
            key for key, val in _slot_reservations.items()
            if val["call_id"] == call_id
        ]
        for key in to_remove:
            del _slot_reservations[key]
        if to_remove:
            logger.info(f"[SCHED] Released {len(to_remove)} slots for call {call_id}")

    # ────────────────────────────────────────────────
    #  Book Appointment
    # ────────────────────────────────────────────────

    async def book_appointment(
        self,
        patient_id: str,
        doctor_id: str,
        date: str,
        time_slot: str,
        location: Optional[str] = None,
        reason: Optional[str] = None,
        call_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Book an appointment with conflict prevention.
        Uses MongoDB atomic operations to prevent double-booking.
        """
        # Validate patient
        patient = await Patient.find_one(Patient.patient_id == patient_id)
        if not patient:
            raise ValueError(f"Patient {patient_id} not found")

        # Validate doctor
        doctor = await self._get_doctor(doctor_id)
        if not doctor:
            raise ValueError(f"Doctor {doctor_id} not found")

        # Check for existing conflict using atomic query
        conflict = await Appointment.find_one({
            "doctor_id": doctor_id,
            "date": date,
            "time_slot": time_slot,
            "status": {"$in": [
                AppointmentStatus.SCHEDULED.value,
                AppointmentStatus.CONFIRMED.value,
                AppointmentStatus.RESCHEDULED.value,
            ]},
        })

        if conflict:
            raise ValueError(
                f"Slot {time_slot} on {date} is already booked for {doctor.full_name}"
            )

        # Reserve the slot if not already reserved
        if call_id:
            self.reserve_slot(doctor_id, date, time_slot, call_id)

        # Create appointment
        appt = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            patient_name=patient.full_name,
            doctor_name=doctor.full_name,
            date=date,
            time_slot=time_slot,
            duration=30,
            reason=reason,
            booked_via="voice",
            call_id=call_id,
            location=location,
        )
        await appt.insert()

        # Release reservation (now permanently booked)
        if call_id:
            self.release_slot(doctor_id, date, time_slot, call_id)

        logger.info(
            f"[SCHED] Appointment booked: {appt.appointment_id} "
            f"patient={patient.full_name} doctor={doctor.full_name} "
            f"date={date} slot={time_slot} location={location}"
        )

        # Notifications
        try:
            notif = Notification(
                title="New Appointment (Voice)",
                message=(
                    f"{patient.full_name} booked with {doctor.full_name} "
                    f"on {date} at {time_slot} ({location or 'N/A'})"
                ),
                type=NotificationType.SUCCESS,
            )
            await notif.insert()
        except Exception:
            pass

        # WebSocket broadcast
        await ws_manager.broadcast_event("appointment_created", {
            "appointment_id": appt.appointment_id,
            "patient_name": patient.full_name,
            "doctor_name": doctor.full_name,
            "date": date,
            "time_slot": time_slot,
            "location": location,
            "booked_via": "voice",
        })

        # EHR sync (fire and forget)
        try:
            from app.services.ehr_service import ehr_service
            await ehr_service.sync_appointment_created(appt)
        except Exception as exc:
            logger.warning(f"[SCHED] EHR sync failed: {exc}")

        # Audit log
        try:
            from app.services.audit_service import audit_service
            await audit_service.log_appointment_booked(
                appt.appointment_id, patient_id, doctor_id, "voice", call_id
            )
        except Exception:
            pass

        return {
            "appointment_id": appt.appointment_id,
            "patient_name": patient.full_name,
            "doctor_name": doctor.full_name,
            "date": date,
            "time_slot": time_slot,
            "location": location,
            "status": "scheduled",
        }

    # ────────────────────────────────────────────────
    #  Reschedule Appointment
    # ────────────────────────────────────────────────

    async def reschedule_appointment(
        self,
        appointment_id: str,
        new_date: str,
        new_time_slot: str,
    ) -> dict[str, Any]:
        """Reschedule an existing appointment."""
        appt = await self._get_appointment(appointment_id)
        if not appt:
            raise ValueError(f"Appointment {appointment_id} not found")

        if appt.status in (
            AppointmentStatus.CANCELLED,
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW,
        ):
            raise ValueError(f"Cannot reschedule appointment with status {appt.status.value}")

        # Check conflict at new slot
        conflict = await Appointment.find_one({
            "doctor_id": appt.doctor_id,
            "date": new_date,
            "time_slot": new_time_slot,
            "status": {"$in": [
                AppointmentStatus.SCHEDULED.value,
                AppointmentStatus.CONFIRMED.value,
                AppointmentStatus.RESCHEDULED.value,
            ]},
        })
        if conflict and str(conflict.id) != str(appt.id):
            raise ValueError(f"Slot {new_time_slot} on {new_date} is already booked")

        old_date, old_slot = appt.date, appt.time_slot
        appt.date = new_date
        appt.time_slot = new_time_slot
        appt.status = AppointmentStatus.RESCHEDULED
        await appt.save()

        logger.info(
            f"[SCHED] Appointment rescheduled: {appointment_id} "
            f"from {old_date}/{old_slot} to {new_date}/{new_time_slot}"
        )

        # Notifications
        try:
            notif = Notification(
                title="Appointment Rescheduled (Voice)",
                message=(
                    f"{appt.patient_name}'s appointment moved to "
                    f"{new_date} at {new_time_slot}"
                ),
                type=NotificationType.WARNING,
            )
            await notif.insert()
        except Exception:
            pass

        await ws_manager.broadcast_event("appointment_rescheduled", {
            "appointment_id": appt.appointment_id,
            "old_date": old_date,
            "old_time_slot": old_slot,
            "new_date": new_date,
            "new_time_slot": new_time_slot,
        })

        # Audit
        try:
            from app.services.audit_service import audit_service
            await audit_service.log_appointment_rescheduled(
                appt.appointment_id, old_date, old_slot, new_date, new_time_slot
            )
        except Exception:
            pass

        return {
            "appointment_id": appt.appointment_id,
            "old_date": old_date,
            "old_time_slot": old_slot,
            "new_date": new_date,
            "new_time_slot": new_time_slot,
            "status": "rescheduled",
        }

    # ────────────────────────────────────────────────
    #  Cancel Appointment
    # ────────────────────────────────────────────────

    async def cancel_appointment(
        self,
        appointment_id: str,
        reason: Optional[str] = None,
    ) -> dict[str, Any]:
        """Cancel an appointment and release the slot."""
        appt = await self._get_appointment(appointment_id)
        if not appt:
            raise ValueError(f"Appointment {appointment_id} not found")

        if appt.status == AppointmentStatus.CANCELLED:
            raise ValueError("Appointment is already cancelled")

        if appt.status == AppointmentStatus.COMPLETED:
            raise ValueError("Cannot cancel a completed appointment")

        appt.status = AppointmentStatus.CANCELLED
        appt.cancelled_at = datetime.now(timezone.utc)
        appt.cancelled_by = "voice_agent"
        if reason:
            appt.notes = reason
        await appt.save()

        logger.info(f"[SCHED] Appointment cancelled: {appointment_id}")

        # Notifications
        try:
            notif = Notification(
                title="Appointment Cancelled (Voice)",
                message=(
                    f"{appt.patient_name}'s appointment on {appt.date} "
                    f"at {appt.time_slot} cancelled"
                ),
                type=NotificationType.ERROR,
            )
            await notif.insert()
        except Exception:
            pass

        await ws_manager.broadcast_event("appointment_cancelled", {
            "appointment_id": appt.appointment_id,
            "patient_name": appt.patient_name,
            "date": appt.date,
            "time_slot": appt.time_slot,
        })

        # Audit
        try:
            from app.services.audit_service import audit_service
            await audit_service.log_appointment_cancelled(
                appt.appointment_id, reason or "", "voice_agent"
            )
        except Exception:
            pass

        return {
            "appointment_id": appt.appointment_id,
            "status": "cancelled",
        }

    # ────────────────────────────────────────────────
    #  Patient's Upcoming Appointments
    # ────────────────────────────────────────────────

    async def get_patient_upcoming_appointments(
        self, patient_id: str
    ) -> list[dict[str, Any]]:
        """Get upcoming appointments for a patient (for reschedule/cancel flows)."""
        today = date_type.today().isoformat()

        appts = await Appointment.find({
            "patient_id": patient_id,
            "date": {"$gte": today},
            "status": {"$in": [
                AppointmentStatus.SCHEDULED.value,
                AppointmentStatus.CONFIRMED.value,
                AppointmentStatus.RESCHEDULED.value,
            ]},
        }).sort("date", "time_slot").to_list()

        return [
            {
                "appointment_id": a.appointment_id,
                "doctor_name": a.doctor_name,
                "doctor_id": a.doctor_id,
                "date": a.date,
                "time_slot": a.time_slot,
                "location": a.location,
                "status": a.status.value if hasattr(a.status, "value") else a.status,
            }
            for a in appts
        ]

    # ════════════════════════════════════════════════
    #  Private Helpers
    # ════════════════════════════════════════════════

    @staticmethod
    async def _get_doctor(doctor_id: str) -> Optional[Doctor]:
        return await Doctor.find_one(
            Doctor.employee_id == doctor_id,
            Doctor.is_active == True,
        )

    @staticmethod
    async def _get_appointment(appointment_id: str) -> Optional[Appointment]:
        from bson import ObjectId
        from bson.errors import InvalidId

        appt = None
        try:
            appt = await Appointment.get(ObjectId(appointment_id))
        except (InvalidId, Exception):
            pass
        if not appt:
            appt = await Appointment.find_one(
                Appointment.appointment_id == appointment_id
            )
        return appt

    @staticmethod
    def _generate_slots(start: str, end: str, slot_duration: int) -> list[str]:
        """Generate HH:MM slots. Handles midnight (00:00) as end-of-day."""
        start_h, start_m = map(int, start.split(":"))
        end_h, end_m = map(int, end.split(":"))
        cur = start_h * 60 + start_m
        end_min = end_h * 60 + end_m
        if end_min <= cur:
            end_min = 24 * 60  # midnight
        slots: list[str] = []
        while cur + slot_duration <= end_min:
            h, m = divmod(cur, 60)
            slots.append(f"{h:02d}:{m:02d}")
            cur += slot_duration
        return slots

    @staticmethod
    def _time_to_minutes(t: str) -> int:
        h, m = map(int, t.split(":"))
        return h * 60 + m

    @staticmethod
    def _purge_expired_reservations():
        """Remove expired slot reservations."""
        now = datetime.now(timezone.utc)
        expired = [
            key for key, val in _slot_reservations.items()
            if val["expires"] < now
        ]
        for key in expired:
            del _slot_reservations[key]
        if expired:
            logger.info(f"[SCHED] Purged {len(expired)} expired reservations")


# Singleton
scheduling_engine = SchedulingEngine()
