"""
Doctor business-logic service layer.
Encapsulates doctor CRUD, schedule management, and availability checks.
"""

from datetime import datetime, timezone
from typing import List, Optional

from app.models.doctor import Doctor, DoctorAvailability, DoctorResponse
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus
from fastapi import HTTPException
from loguru import logger


class DoctorService:
    async def get_by_id(self, employee_id: str) -> Doctor:
        doctor = await Doctor.find_one(Doctor.employee_id == employee_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return doctor

    async def list_active(
        self,
        specialization: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Doctor]:
        query = {"is_active": True}
        if specialization:
            from app.utils.helpers import sanitize_search

            safe_q = sanitize_search(specialization)
            query["specialization"] = {"$regex": safe_q, "$options": "i"}
        return await Doctor.find(query).skip(skip).limit(limit).to_list()

    async def check_availability(self, employee_id: str, date: str) -> dict:
        doctor = await self.get_by_id(employee_id)

        target_date = datetime.strptime(date, "%Y-%m-%d")
        day_name = target_date.strftime("%A").lower()

        # Check date-specific overrides
        override = await DoctorAvailability.find_one(
            DoctorAvailability.doctor_id == employee_id,
            DoctorAvailability.date == date,
        )

        if override and not override.is_available:
            return {
                "doctor": doctor.full_name,
                "date": date,
                "available_slots": [],
                "total_slots": 0,
                "booked_slots": 0,
                "is_working_day": False,
                "message": override.reason or f"Doctor not available on {date}",
            }

        # Determine hours (override or weekly schedule)
        if override and override.override_start and override.override_end:
            start_str, end_str = override.override_start, override.override_end
            slot_duration = (
                doctor.schedule[day_name].slot_duration
                if day_name in doctor.schedule
                else 30
            )
        elif day_name in doctor.schedule:
            sched = doctor.schedule[day_name]
            start_str, end_str = sched.start, sched.end
            slot_duration = sched.slot_duration
        else:
            return {
                "doctor": doctor.full_name,
                "date": date,
                "available_slots": [],
                "total_slots": 0,
                "booked_slots": 0,
                "is_working_day": False,
                "message": f"Doctor not available on {day_name}",
            }

        # Generate all time slots
        all_slots: List[str] = []
        start_h, start_m = map(int, start_str.split(":"))
        end_h, end_m = map(int, end_str.split(":"))
        cur = start_h * 60 + start_m
        end_mins = end_h * 60 + end_m
        while cur + slot_duration <= end_mins:
            h, m = divmod(cur, 60)
            all_slots.append(f"{h:02d}:{m:02d}")
            cur += slot_duration

        # Blocked slots from override
        blocked_set: set = set()
        if override and override.blocked_slots:
            blocked_set = set(override.blocked_slots)

        # Find booked slots
        booked = await Appointment.find(
            Appointment.doctor_id == employee_id,
            Appointment.date == date,
            Appointment.status.is_in([
                AppointmentStatus.SCHEDULED.value,
                AppointmentStatus.CONFIRMED.value,
            ]),
        ).to_list()
        booked_set = {a.time_slot for a in booked}

        unavailable = booked_set | blocked_set
        available = [s for s in all_slots if s not in unavailable]

        return {
            "doctor": doctor.full_name,
            "date": date,
            "available_slots": available,
            "total_slots": len(all_slots),
            "booked_slots": len(booked_set),
            "is_working_day": True,
        }

    async def deactivate(self, employee_id: str) -> Doctor:
        doctor = await self.get_by_id(employee_id)
        doctor.is_active = False
        doctor.updated_at = datetime.now(timezone.utc)
        await doctor.save()
        logger.info(f"Doctor deactivated: {employee_id}")
        return doctor


# Singleton
doctor_service = DoctorService()
