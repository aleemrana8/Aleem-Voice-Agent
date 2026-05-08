from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.models.appointment import Appointment
from app.models.call_log import CallLog
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def dashboard_stats(current_user: User = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    total_patients = await Patient.count()
    total_doctors = await Doctor.find(Doctor.is_active == True).count()
    total_appointments = await Appointment.count()
    today_appointments = await Appointment.find(Appointment.date == today).count()
    total_calls = await CallLog.count()
    active_calls = await CallLog.find(CallLog.status == "in_progress").count()

    # Status breakdown
    scheduled = await Appointment.find(Appointment.status == "scheduled").count()
    completed = await Appointment.find(Appointment.status == "completed").count()
    cancelled = await Appointment.find(Appointment.status == "cancelled").count()

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "today_appointments": today_appointments,
        "total_calls": total_calls,
        "active_calls": active_calls,
        "appointment_breakdown": {
            "scheduled": scheduled,
            "completed": completed,
            "cancelled": cancelled,
        },
    }


@router.get("/recent-appointments")
async def recent_appointments(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
):
    appointments = (
        await Appointment.find()
        .sort("-created_at")
        .limit(limit)
        .to_list()
    )
    from app.schemas.appointment import AppointmentListItem
    return [AppointmentListItem.from_doc(a) for a in appointments]


@router.get("/recent-calls")
async def recent_calls(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
):
    calls = (
        await CallLog.find()
        .sort("-created_at")
        .limit(limit)
        .to_list()
    )
    from app.models.call_log import CallLogResponse
    return [CallLogResponse.from_doc(c) for c in calls]
