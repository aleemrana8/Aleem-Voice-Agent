"""
Doctor schedule management service.

Handles weekly schedule CRUD, holiday/override management,
and the slot generation algorithm with break-time exclusion,
blocked-slot handling, and overlap prevention.
"""

import calendar
from datetime import date as date_type, datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple

from fastapi import HTTPException, status
from loguru import logger

from app.models.appointment import Appointment
from app.models.doctor import BreakTime, DaySchedule, Doctor, DoctorAvailability
from app.models.enums import AppointmentStatus, DayOfWeek
from app.schemas.schedule import (
    BreakTimeSchema,
    DayAvailabilityResponse,
    DayScheduleSchema,
    MonthlyAvailabilityResponse,
    OverrideResponse,
    SlotDetail,
    WeeklyAvailabilityResponse,
    WeeklyScheduleResponse,
)


class ScheduleService:
    """Single source of truth for doctor schedule operations."""

    # ════════════════════════════════════════════════
    #  Weekly Schedule CRUD
    # ════════════════════════════════════════════════

    async def get_weekly_schedule(self, doctor_id: str) -> WeeklyScheduleResponse:
        """Return the doctor's base weekly schedule."""
        doctor = await self._require_doctor(doctor_id)
        all_days = [d.value for d in DayOfWeek]
        working = list(doctor.schedule.keys())
        off = [d for d in all_days if d not in working]

        schedule_out: Dict[str, DayScheduleSchema] = {}
        for day_name, sched in doctor.schedule.items():
            schedule_out[day_name] = DayScheduleSchema(
                start=sched.start,
                end=sched.end,
                slot_duration=sched.slot_duration,
                breaks=[
                    BreakTimeSchema(start=b.start, end=b.end, label=b.label)
                    for b in sched.breaks
                ],
            )

        return WeeklyScheduleResponse(
            doctor_id=doctor.employee_id,
            doctor_name=doctor.full_name,
            schedule=schedule_out,
            working_days=working,
            off_days=off,
        )

    async def set_weekly_schedule(
        self, doctor_id: str, schedule: Dict[str, DayScheduleSchema]
    ) -> WeeklyScheduleResponse:
        """Replace the entire weekly schedule."""
        doctor = await self._require_doctor(doctor_id)

        new_schedule: Dict[str, DaySchedule] = {}
        for day_name, day_schema in schedule.items():
            new_schedule[day_name] = DaySchedule(
                start=day_schema.start,
                end=day_schema.end,
                slot_duration=day_schema.slot_duration,
                breaks=[
                    BreakTime(start=b.start, end=b.end, label=b.label)
                    for b in day_schema.breaks
                ],
            )

        doctor.schedule = new_schedule
        await doctor.save()
        logger.info("Weekly schedule set | doctor={}", doctor_id)
        return await self.get_weekly_schedule(doctor_id)

    async def update_day_schedule(
        self,
        doctor_id: str,
        day: str,
        start: str,
        end: str,
        slot_duration: int,
        breaks: List[BreakTimeSchema],
    ) -> WeeklyScheduleResponse:
        """Update the schedule for a single weekday."""
        doctor = await self._require_doctor(doctor_id)

        valid_days = {d.value for d in DayOfWeek}
        if day not in valid_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid day '{day}'. Use: {', '.join(sorted(valid_days))}",
            )

        doctor.schedule[day] = DaySchedule(
            start=start,
            end=end,
            slot_duration=slot_duration,
            breaks=[
                BreakTime(start=b.start, end=b.end, label=b.label)
                for b in breaks
            ],
        )
        await doctor.save()
        logger.info("Day schedule updated | doctor={} day={}", doctor_id, day)
        return await self.get_weekly_schedule(doctor_id)

    async def remove_day_schedule(
        self, doctor_id: str, day: str
    ) -> WeeklyScheduleResponse:
        """Remove a day from the weekly schedule (mark as day off)."""
        doctor = await self._require_doctor(doctor_id)
        if day not in doctor.schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No schedule found for {day}",
            )
        del doctor.schedule[day]
        await doctor.save()
        logger.info("Day removed from schedule | doctor={} day={}", doctor_id, day)
        return await self.get_weekly_schedule(doctor_id)

    # ════════════════════════════════════════════════
    #  Holiday / Override Management
    # ════════════════════════════════════════════════

    async def create_holidays(
        self,
        doctor_id: str,
        dates: List[str],
        reason: Optional[str],
        override_type: str,
    ) -> List[OverrideResponse]:
        """Mark one or more dates as unavailable (holiday/leave)."""
        await self._require_doctor(doctor_id)
        results: List[OverrideResponse] = []

        for d in dates:
            # Upsert — replace if override already exists for this date
            existing = await DoctorAvailability.find_one(
                DoctorAvailability.doctor_id == doctor_id,
                DoctorAvailability.date == d,
            )
            if existing:
                existing.is_available = False
                existing.override_type = override_type
                existing.reason = reason
                existing.override_start = None
                existing.override_end = None
                existing.blocked_slots = []
                existing.override_breaks = []
                await existing.save()
                results.append(OverrideResponse.from_doc(existing))
            else:
                override = DoctorAvailability(
                    doctor_id=doctor_id,
                    date=d,
                    is_available=False,
                    override_type=override_type,
                    reason=reason,
                )
                await override.insert()
                results.append(OverrideResponse.from_doc(override))

        logger.info(
            "Holidays created | doctor={} dates={} type={}",
            doctor_id, dates, override_type,
        )
        return results

    async def create_override(
        self,
        doctor_id: str,
        date: str,
        is_available: bool,
        override_type: str,
        override_start: Optional[str],
        override_end: Optional[str],
        blocked_slots: List[str],
        override_breaks: List[BreakTimeSchema],
        reason: Optional[str],
    ) -> OverrideResponse:
        """Create or update a date-specific schedule override."""
        await self._require_doctor(doctor_id)

        breaks_models = [
            BreakTime(start=b.start, end=b.end, label=b.label)
            for b in override_breaks
        ]

        existing = await DoctorAvailability.find_one(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.date == date,
        )
        if existing:
            existing.is_available = is_available
            existing.override_type = override_type
            existing.override_start = override_start
            existing.override_end = override_end
            existing.blocked_slots = blocked_slots
            existing.override_breaks = breaks_models
            existing.reason = reason
            await existing.save()
            logger.info("Override updated | doctor={} date={}", doctor_id, date)
            return OverrideResponse.from_doc(existing)

        override = DoctorAvailability(
            doctor_id=doctor_id,
            date=date,
            is_available=is_available,
            override_type=override_type,
            override_start=override_start,
            override_end=override_end,
            blocked_slots=blocked_slots,
            override_breaks=breaks_models,
            reason=reason,
        )
        await override.insert()
        logger.info("Override created | doctor={} date={}", doctor_id, date)
        return OverrideResponse.from_doc(override)

    async def delete_override(self, doctor_id: str, date: str) -> None:
        """Remove a date-specific override, reverting to weekly schedule."""
        override = await DoctorAvailability.find_one(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.date == date,
        )
        if not override:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No override found for {date}",
            )
        await override.delete()
        logger.info("Override deleted | doctor={} date={}", doctor_id, date)

    async def list_overrides(
        self,
        doctor_id: str,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        override_type: Optional[str] = None,
    ) -> List[OverrideResponse]:
        """List all overrides for a doctor, optionally filtered by date range / type."""
        await self._require_doctor(doctor_id)
        query: Dict = {"doctor_id": doctor_id}
        if date_from or date_to:
            date_filter: Dict = {}
            if date_from:
                date_filter["$gte"] = date_from
            if date_to:
                date_filter["$lte"] = date_to
            query["date"] = date_filter
        if override_type:
            query["override_type"] = override_type

        docs = await DoctorAvailability.find(query).sort("date").to_list()
        return [OverrideResponse.from_doc(d) for d in docs]

    # ════════════════════════════════════════════════
    #  Slot Generation Algorithm
    # ════════════════════════════════════════════════

    async def get_day_availability(
        self, doctor_id: str, target_date: str
    ) -> DayAvailabilityResponse:
        """
        Generate all time slots for a doctor on a specific date.

        Algorithm:
        1. Check DoctorAvailability for date-specific override
        2. Fall back to weekly DaySchedule
        3. Generate slots at `slot_duration` intervals
        4. Exclude slots that fall within break windows
        5. Mark booked slots (from appointments collection)
        6. Mark blocked slots (from override)
        """
        doctor = await self._require_doctor(doctor_id)
        dt = datetime.strptime(target_date, "%Y-%m-%d")
        day_name = dt.strftime("%A").lower()

        # 1) Date-specific override
        override = await DoctorAvailability.find_one(
            DoctorAvailability.doctor_id == doctor_id,
            DoctorAvailability.date == target_date,
        )

        # Day is fully blocked (holiday / leave)
        if override and not override.is_available:
            return DayAvailabilityResponse(
                doctor_id=doctor_id,
                doctor_name=doctor.full_name,
                date=target_date,
                day=day_name,
                is_working_day=False,
                override_type=override.override_type,
                message=override.reason or f"Doctor unavailable on {target_date}",
            )

        # 2) Determine working hours and breaks
        start_str: Optional[str] = None
        end_str: Optional[str] = None
        slot_duration: int = 30
        breaks: List[BreakTime] = []
        override_type: Optional[str] = None

        if override and override.override_start and override.override_end:
            # Override hours take precedence
            start_str = override.override_start
            end_str = override.override_end
            override_type = override.override_type
            slot_duration = (
                doctor.schedule[day_name].slot_duration
                if day_name in doctor.schedule
                else 30
            )
            # Override breaks take precedence, else use daily breaks
            if override.override_breaks:
                breaks = override.override_breaks
            elif day_name in doctor.schedule:
                breaks = doctor.schedule[day_name].breaks
        elif day_name in doctor.schedule:
            sched = doctor.schedule[day_name]
            start_str = sched.start
            end_str = sched.end
            slot_duration = sched.slot_duration
            breaks = sched.breaks
            if override:
                override_type = override.override_type
        else:
            # Not a working day and no override with custom hours
            return DayAvailabilityResponse(
                doctor_id=doctor_id,
                doctor_name=doctor.full_name,
                date=target_date,
                day=day_name,
                is_working_day=False,
                override_type=override.override_type if override else None,
                message=f"Doctor does not work on {day_name}s",
            )

        # 3) Generate raw time slots
        all_times = self._generate_slots(start_str, end_str, slot_duration)

        # 4) Build break ranges (in minutes) for fast lookup
        break_ranges = self._build_break_ranges(breaks)

        # 5) Blocked slots from override
        blocked_set: set = set()
        if override and override.blocked_slots:
            blocked_set = set(override.blocked_slots)

        # 6) Booked slots from appointments
        booked_appts = await Appointment.find(
            Appointment.doctor_id == doctor_id,
            Appointment.date == target_date,
            {"status": {"$in": [
                AppointmentStatus.SCHEDULED.value,
                AppointmentStatus.CONFIRMED.value,
            ]}},
        ).to_list()
        booked_set = {a.time_slot for a in booked_appts}

        # 7) Build slot details
        slots: List[SlotDetail] = []
        for t in all_times:
            t_min = self._time_to_minutes(t)
            in_break = any(bs <= t_min < be for bs, be in break_ranges)
            in_blocked = t in blocked_set
            in_booked = t in booked_set
            available = not (in_break or in_blocked or in_booked)

            slots.append(SlotDetail(
                time=t,
                available=available,
                is_break=in_break,
                is_blocked=in_blocked,
                is_booked=in_booked,
            ))

        breaks_schema = [
            BreakTimeSchema(start=b.start, end=b.end, label=b.label)
            for b in breaks
        ]

        available_count = sum(1 for s in slots if s.available)
        booked_count = sum(1 for s in slots if s.is_booked)
        break_count = sum(1 for s in slots if s.is_break)
        blocked_count = sum(1 for s in slots if s.is_blocked)

        return DayAvailabilityResponse(
            doctor_id=doctor_id,
            doctor_name=doctor.full_name,
            date=target_date,
            day=day_name,
            is_working_day=True,
            override_type=override_type,
            working_hours={"start": start_str, "end": end_str},
            breaks=breaks_schema,
            slots=slots,
            available_count=available_count,
            booked_count=booked_count,
            break_count=break_count,
            blocked_count=blocked_count,
            total_count=len(slots),
            message=None,
        )

    # ────────────────────────────────────────────────
    #  Weekly Availability
    # ────────────────────────────────────────────────
    async def get_weekly_availability(
        self, doctor_id: str, week_start: str
    ) -> WeeklyAvailabilityResponse:
        """
        Generate availability for a full week starting from `week_start` (Monday).
        If `week_start` is not a Monday the closest preceding Monday is used.
        """
        doctor = await self._require_doctor(doctor_id)
        start_dt = datetime.strptime(week_start, "%Y-%m-%d").date()
        # Snap to Monday
        start_dt = start_dt - timedelta(days=start_dt.weekday())
        end_dt = start_dt + timedelta(days=6)

        days: List[DayAvailabilityResponse] = []
        total_available = 0
        total_booked = 0

        for offset in range(7):
            d = start_dt + timedelta(days=offset)
            day_resp = await self.get_day_availability(doctor_id, d.isoformat())
            days.append(day_resp)
            total_available += day_resp.available_count
            total_booked += day_resp.booked_count

        return WeeklyAvailabilityResponse(
            doctor_id=doctor_id,
            doctor_name=doctor.full_name,
            week_start=start_dt.isoformat(),
            week_end=end_dt.isoformat(),
            days=days,
            total_available=total_available,
            total_booked=total_booked,
        )

    # ────────────────────────────────────────────────
    #  Monthly Availability
    # ────────────────────────────────────────────────
    async def get_monthly_availability(
        self, doctor_id: str, month: str
    ) -> MonthlyAvailabilityResponse:
        """
        Generate a per-day availability summary for an entire month.
        `month` is YYYY-MM.
        """
        doctor = await self._require_doctor(doctor_id)

        year, mon = map(int, month.split("-"))
        num_days = calendar.monthrange(year, mon)[1]

        days: List[DayAvailabilityResponse] = []
        total_available = 0
        total_booked = 0
        working_days_count = 0
        holiday_count = 0

        for day_num in range(1, num_days + 1):
            d = date_type(year, mon, day_num).isoformat()
            day_resp = await self.get_day_availability(doctor_id, d)
            days.append(day_resp)
            total_available += day_resp.available_count
            total_booked += day_resp.booked_count
            if day_resp.is_working_day:
                working_days_count += 1
            elif day_resp.override_type in ("holiday", "leave"):
                holiday_count += 1

        return MonthlyAvailabilityResponse(
            doctor_id=doctor_id,
            doctor_name=doctor.full_name,
            month=month,
            days=days,
            working_days_count=working_days_count,
            holiday_count=holiday_count,
            total_available=total_available,
            total_booked=total_booked,
        )

    # ════════════════════════════════════════════════
    #  Private helpers
    # ════════════════════════════════════════════════

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
    def _time_to_minutes(t: str) -> int:
        """Convert HH:MM to minutes since midnight."""
        h, m = map(int, t.split(":"))
        return h * 60 + m

    @staticmethod
    def _generate_slots(start: str, end: str, slot_duration: int) -> List[str]:
        """Generate HH:MM time slots between start and end."""
        start_h, start_m = map(int, start.split(":"))
        end_h, end_m = map(int, end.split(":"))
        cur = start_h * 60 + start_m
        end_min = end_h * 60 + end_m
        slots: List[str] = []
        while cur + slot_duration <= end_min:
            h, m = divmod(cur, 60)
            slots.append(f"{h:02d}:{m:02d}")
            cur += slot_duration
        return slots

    @classmethod
    def _build_break_ranges(cls, breaks: List[BreakTime]) -> List[Tuple[int, int]]:
        """Convert break windows to (start_minutes, end_minutes) tuples."""
        return [
            (cls._time_to_minutes(b.start), cls._time_to_minutes(b.end))
            for b in breaks
        ]


# Singleton
schedule_service = ScheduleService()
