"""
Notification Background Tasks
==============================
Send notifications for appointments, calls, and system events.
"""

from app.core.celery_app import celery_app
from loguru import logger


@celery_app.task(name="app.tasks.notifications.send_appointment_confirmation")
def send_appointment_confirmation(appointment_id: str, patient_phone: str):
    """Send SMS/notification confirming appointment booking."""
    logger.info(
        f"[CELERY] Sending appointment confirmation: {appointment_id} → {patient_phone}"
    )
    # In production: integrate with SMS gateway (Twilio, etc.)
    # For now, log the event
    return {"status": "sent", "appointment_id": appointment_id}


@celery_app.task(name="app.tasks.notifications.send_reschedule_notification")
def send_reschedule_notification(appointment_id: str, patient_phone: str, new_date: str, new_time: str):
    """Notify patient of rescheduled appointment."""
    logger.info(
        f"[CELERY] Reschedule notification: {appointment_id} → {patient_phone} ({new_date} {new_time})"
    )
    return {"status": "sent", "appointment_id": appointment_id}


@celery_app.task(name="app.tasks.notifications.send_cancellation_notification")
def send_cancellation_notification(appointment_id: str, patient_phone: str):
    """Notify patient of cancelled appointment."""
    logger.info(
        f"[CELERY] Cancellation notification: {appointment_id} → {patient_phone}"
    )
    return {"status": "sent", "appointment_id": appointment_id}


@celery_app.task(name="app.tasks.notifications.send_reminder")
def send_appointment_reminder(appointment_id: str, patient_phone: str, hours_before: int = 24):
    """Send appointment reminder N hours before."""
    logger.info(
        f"[CELERY] Reminder ({hours_before}h): {appointment_id} → {patient_phone}"
    )
    return {"status": "sent", "appointment_id": appointment_id}
