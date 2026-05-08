"""
EHR Integration Service.
Handles synchronization between the voice agent system and
Aleem EHR platform. Implements retry mechanism, audit logging,
and event-driven sync for appointments, patients, and call logs.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from loguru import logger

from app.core.config import settings
from app.models.appointment import Appointment
from app.models.call_log import CallLog
from app.models.ehr_sync import EHRSyncLog
from app.models.enums import EHRSyncStatus, EHRSyncType
from app.models.patient import Patient


class EHRService:
    """Manages data synchronization with Aleem EHR system."""

    def __init__(self):
        self.base_url = settings.EHR_BASE_URL
        self.api_key = settings.EHR_API_KEY
        self.timeout = 30.0
        self.max_retries = 3

    def _get_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "X-Source": "aleem-voice-agent",
        }

    # ════════════════════════════════════════════════
    #  Appointment Sync
    # ════════════════════════════════════════════════

    async def sync_appointment_created(self, appointment: Appointment) -> EHRSyncLog:
        """Sync a newly created appointment to EHR."""
        payload = {
            "appointment_id": appointment.appointment_id,
            "patient_id": appointment.patient_id,
            "patient_name": appointment.patient_name,
            "doctor_id": appointment.doctor_id,
            "doctor_name": appointment.doctor_name,
            "date": appointment.date,
            "time_slot": appointment.time_slot,
            "duration": appointment.duration,
            "reason": appointment.reason,
            "status": appointment.status.value if hasattr(appointment.status, "value") else appointment.status,
            "booked_via": appointment.booked_via if isinstance(appointment.booked_via, str) else appointment.booked_via.value,
            "created_at": appointment.created_at.isoformat(),
        }

        sync_log = EHRSyncLog(
            sync_type=EHRSyncType.APPOINTMENT_CREATED,
            entity_id=appointment.appointment_id,
            entity_type="appointment",
            payload=payload,
        )
        await sync_log.insert()

        await self._execute_sync(sync_log, "/api/ehr/appointments", payload)
        return sync_log

    async def sync_appointment_rescheduled(self, appointment: Appointment) -> EHRSyncLog:
        """Sync a rescheduled appointment to EHR."""
        payload = {
            "appointment_id": appointment.appointment_id,
            "new_date": appointment.date,
            "new_time_slot": appointment.time_slot,
            "status": "rescheduled",
            "updated_at": appointment.updated_at.isoformat(),
        }

        sync_log = EHRSyncLog(
            sync_type=EHRSyncType.APPOINTMENT_RESCHEDULED,
            entity_id=appointment.appointment_id,
            entity_type="appointment",
            payload=payload,
        )
        await sync_log.insert()

        await self._execute_sync(sync_log, "/api/ehr/appointments/reschedule", payload)
        return sync_log

    async def sync_appointment_cancelled(self, appointment: Appointment) -> EHRSyncLog:
        """Sync a cancelled appointment to EHR."""
        payload = {
            "appointment_id": appointment.appointment_id,
            "status": "cancelled",
            "cancelled_at": appointment.cancelled_at.isoformat() if appointment.cancelled_at else None,
            "cancelled_by": appointment.cancelled_by,
            "reason": appointment.notes,
        }

        sync_log = EHRSyncLog(
            sync_type=EHRSyncType.APPOINTMENT_CANCELLED,
            entity_id=appointment.appointment_id,
            entity_type="appointment",
            payload=payload,
        )
        await sync_log.insert()

        await self._execute_sync(sync_log, "/api/ehr/appointments/cancel", payload)
        return sync_log

    # ════════════════════════════════════════════════
    #  Patient Sync
    # ════════════════════════════════════════════════

    async def sync_patient_created(self, patient: Patient) -> EHRSyncLog:
        """Sync a newly created patient to EHR."""
        payload = {
            "patient_id": patient.patient_id,
            "full_name": patient.full_name,
            "phone": patient.phone,
            "email": patient.email,
            "date_of_birth": patient.date_of_birth,
            "gender": patient.gender.value if patient.gender else None,
            "blood_group": patient.blood_group.value if patient.blood_group else None,
            "address": patient.address,
            "allergies": patient.allergies,
            "created_at": patient.created_at.isoformat(),
        }

        sync_log = EHRSyncLog(
            sync_type=EHRSyncType.PATIENT_CREATED,
            entity_id=patient.patient_id,
            entity_type="patient",
            payload=payload,
        )
        await sync_log.insert()

        await self._execute_sync(sync_log, "/api/ehr/patients", payload)
        return sync_log

    # ════════════════════════════════════════════════
    #  Call Log Sync
    # ════════════════════════════════════════════════

    async def sync_call_log(self, call_log: CallLog) -> EHRSyncLog:
        """Sync a completed call log to EHR."""
        payload = {
            "call_id": call_log.call_id,
            "caller_phone": call_log.caller_phone,
            "patient_id": call_log.patient_id,
            "patient_name": call_log.patient_name,
            "duration_seconds": call_log.duration_seconds,
            "status": call_log.status.value if hasattr(call_log.status, "value") else call_log.status,
            "intent": call_log.intent.value if call_log.intent and hasattr(call_log.intent, "value") else call_log.intent,
            "summary": call_log.summary,
            "created_at": call_log.created_at.isoformat(),
            "ended_at": call_log.ended_at.isoformat() if call_log.ended_at else None,
        }

        sync_log = EHRSyncLog(
            sync_type=EHRSyncType.CALL_LOG_SYNCED,
            entity_id=call_log.call_id,
            entity_type="call_log",
            payload=payload,
        )
        await sync_log.insert()

        await self._execute_sync(sync_log, "/api/ehr/calls", payload)
        return sync_log

    # ════════════════════════════════════════════════
    #  Retry Failed Syncs
    # ════════════════════════════════════════════════

    async def retry_failed_syncs(self) -> int:
        """Retry all pending/failed sync operations. Returns count of retried."""
        now = datetime.now(timezone.utc)
        pending = await EHRSyncLog.find(
            {"status": {"$in": [EHRSyncStatus.PENDING.value, EHRSyncStatus.RETRY.value]}},
            {"$or": [
                {"next_retry_at": None},
                {"next_retry_at": {"$lte": now}},
            ]},
        ).to_list()

        retried = 0
        for sync_log in pending:
            if sync_log.retry_count >= sync_log.max_retries:
                sync_log.status = EHRSyncStatus.FAILED
                await sync_log.save()
                continue

            endpoint = self._get_endpoint_for_type(sync_log.sync_type)
            if endpoint and sync_log.payload:
                await self._execute_sync(sync_log, endpoint, sync_log.payload)
                retried += 1

        logger.info(f"EHR sync retry: processed {retried} pending syncs")
        return retried

    # ════════════════════════════════════════════════
    #  Stats
    # ════════════════════════════════════════════════

    async def get_sync_stats(self) -> dict:
        """Get EHR sync statistics."""
        total = await EHRSyncLog.count()
        synced = await EHRSyncLog.find(EHRSyncLog.status == EHRSyncStatus.SYNCED).count()
        failed = await EHRSyncLog.find(EHRSyncLog.status == EHRSyncStatus.FAILED).count()
        pending = await EHRSyncLog.find(
            {"status": {"$in": [EHRSyncStatus.PENDING.value, EHRSyncStatus.RETRY.value]}}
        ).count()

        return {
            "total": total,
            "synced": synced,
            "failed": failed,
            "pending": pending,
            "success_rate": round((synced / total * 100), 1) if total > 0 else 100.0,
        }

    # ════════════════════════════════════════════════
    #  Internal
    # ════════════════════════════════════════════════

    async def _execute_sync(
        self, sync_log: EHRSyncLog, endpoint: str, payload: dict
    ):
        """Execute the HTTP sync request to the EHR system."""
        if not self.base_url:
            # EHR not configured — mark as synced (local-only mode)
            sync_log.mark_success({"mode": "local_only", "message": "EHR URL not configured"})
            await sync_log.save()
            logger.debug(f"EHR sync skipped (no URL configured): {sync_log.sync_id}")
            return

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}{endpoint}",
                    json=payload,
                    headers=self._get_headers(),
                )

            if response.status_code in (200, 201):
                sync_log.mark_success(response.json() if response.content else {})
                await sync_log.save()
                logger.info(f"EHR sync success: {sync_log.sync_id} → {endpoint}")
            else:
                error_msg = f"HTTP {response.status_code}: {response.text[:500]}"
                sync_log.mark_failed(error_msg)
                sync_log.next_retry_at = datetime.now(timezone.utc) + timedelta(
                    minutes=2 ** sync_log.retry_count
                )
                await sync_log.save()
                logger.warning(f"EHR sync failed: {sync_log.sync_id} — {error_msg}")

        except httpx.TimeoutException:
            sync_log.mark_failed("Request timed out")
            sync_log.next_retry_at = datetime.now(timezone.utc) + timedelta(minutes=2)
            await sync_log.save()
            logger.warning(f"EHR sync timeout: {sync_log.sync_id}")

        except Exception as e:
            sync_log.mark_failed(str(e)[:500])
            sync_log.next_retry_at = datetime.now(timezone.utc) + timedelta(minutes=5)
            await sync_log.save()
            logger.error(f"EHR sync error: {sync_log.sync_id} — {e}")

    def _get_endpoint_for_type(self, sync_type: EHRSyncType) -> Optional[str]:
        """Map sync type to API endpoint."""
        mapping = {
            EHRSyncType.APPOINTMENT_CREATED: "/api/ehr/appointments",
            EHRSyncType.APPOINTMENT_RESCHEDULED: "/api/ehr/appointments/reschedule",
            EHRSyncType.APPOINTMENT_CANCELLED: "/api/ehr/appointments/cancel",
            EHRSyncType.PATIENT_CREATED: "/api/ehr/patients",
            EHRSyncType.PATIENT_UPDATED: "/api/ehr/patients/update",
            EHRSyncType.CALL_LOG_SYNCED: "/api/ehr/calls",
            EHRSyncType.TRANSCRIPT_SYNCED: "/api/ehr/transcripts",
        }
        return mapping.get(sync_type)


# Singleton
ehr_service = EHRService()
