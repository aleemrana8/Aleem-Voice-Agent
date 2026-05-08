"""
EHR Sync Background Tasks
==========================
Queue-based EHR synchronization with retry and dead letter handling.
"""

from app.core.celery_app import celery_app
from loguru import logger


@celery_app.task(
    name="app.tasks.ehr.sync_appointment",
    bind=True,
    max_retries=5,
    default_retry_delay=60,
)
def sync_appointment_to_ehr(self, appointment_id: str, sync_type: str):
    """Sync appointment event to Aleem EHR system."""
    import asyncio
    from app.services.ehr_service import ehr_service

    async def _sync():
        from app.core.database import Database
        await Database.connect()

        if sync_type == "created":
            await ehr_service.sync_appointment_created(appointment_id)
        elif sync_type == "rescheduled":
            await ehr_service.sync_appointment_rescheduled(appointment_id)
        elif sync_type == "cancelled":
            await ehr_service.sync_appointment_cancelled(appointment_id)

    try:
        asyncio.run(_sync())
        logger.info(f"[CELERY] EHR sync complete: {appointment_id} ({sync_type})")
    except Exception as exc:
        logger.error(f"[CELERY] EHR sync failed: {appointment_id} - {exc}")
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.tasks.ehr.sync_patient",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def sync_patient_to_ehr(self, patient_id: str):
    """Sync new patient to EHR system."""
    import asyncio
    from app.services.ehr_service import ehr_service

    async def _sync():
        from app.core.database import Database
        await Database.connect()
        await ehr_service.sync_patient_created(patient_id)

    try:
        asyncio.run(_sync())
        logger.info(f"[CELERY] Patient sync complete: {patient_id}")
    except Exception as exc:
        logger.error(f"[CELERY] Patient sync failed: {patient_id} - {exc}")
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.tasks.ehr.sync_call_log",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def sync_call_log_to_ehr(self, call_id: str):
    """Sync completed call log and transcript to EHR."""
    import asyncio
    from app.services.ehr_service import ehr_service

    async def _sync():
        from app.core.database import Database
        await Database.connect()
        await ehr_service.sync_call_log(call_id)

    try:
        asyncio.run(_sync())
        logger.info(f"[CELERY] Call log sync complete: {call_id}")
    except Exception as exc:
        logger.error(f"[CELERY] Call log sync failed: {call_id} - {exc}")
        raise self.retry(exc=exc)


@celery_app.task(name="app.tasks.ehr.retry_failed_syncs")
def retry_failed_ehr_syncs():
    """Periodic task to retry all failed EHR syncs."""
    import asyncio
    from app.services.ehr_service import ehr_service

    async def _retry():
        from app.core.database import Database
        await Database.connect()
        await ehr_service.retry_failed_syncs()

    asyncio.run(_retry())
    logger.info("[CELERY] Failed EHR syncs retried")
