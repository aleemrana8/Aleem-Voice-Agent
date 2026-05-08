"""
Analytics Background Tasks
============================
Process and aggregate analytics data for dashboard.
"""

from app.core.celery_app import celery_app
from loguru import logger


@celery_app.task(name="app.tasks.analytics.update_daily_stats")
def update_daily_stats():
    """Aggregate daily statistics for the analytics dashboard."""
    import asyncio

    async def _aggregate():
        from app.core.database import Database
        from app.models.appointment import Appointment
        from app.models.call_log import CallLog
        from datetime import date

        await Database.connect()

        today = date.today().isoformat()
        appointments_today = await Appointment.find(
            Appointment.date == today
        ).count()
        calls_today = await CallLog.find(
            {"created_at": {"$gte": f"{today}T00:00:00"}}
        ).count()

        logger.info(
            f"[ANALYTICS] Daily stats: {appointments_today} appointments, {calls_today} calls"
        )
        return {
            "date": today,
            "appointments": appointments_today,
            "calls": calls_today,
        }

    return asyncio.run(_aggregate())


@celery_app.task(name="app.tasks.analytics.process_call_analytics")
def process_call_analytics(call_id: str):
    """Process a completed call for analytics (duration, intent, outcome)."""
    logger.info(f"[ANALYTICS] Processing call analytics: {call_id}")
    return {"call_id": call_id, "processed": True}
