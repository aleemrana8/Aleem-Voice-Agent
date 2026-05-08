"""
Audit Logging Service
=====================
Records all significant system events for compliance, debugging, and analytics.
"""

from typing import Any, Optional
from datetime import datetime, timezone
from loguru import logger

from app.models.audit_log import AuditLog


class AuditService:
    """Centralized audit logging. All actions should go through here."""

    async def log(
        self,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        actor_type: str = "system",
        actor_id: Optional[str] = None,
        actor_name: Optional[str] = None,
        details: dict[str, Any] = None,
        status: str = "success",
        error_message: Optional[str] = None,
        call_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLog:
        """Create an audit log entry."""
        entry = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            actor_type=actor_type,
            actor_id=actor_id,
            actor_name=actor_name,
            details=details or {},
            status=status,
            error_message=error_message,
            call_id=call_id,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        await entry.insert()
        logger.debug(f"[AUDIT] {action} on {resource_type}/{resource_id} by {actor_type}/{actor_id}")
        return entry

    # ── Convenience Methods ──────────────────────────────────────────

    async def log_appointment_booked(
        self, appointment_id: str, patient_id: str, doctor_id: str,
        booked_via: str = "dashboard", call_id: str = None, actor_id: str = None,
    ):
        await self.log(
            action="appointment_booked",
            resource_type="appointment",
            resource_id=appointment_id,
            actor_type="voice_agent" if booked_via == "voice" else "user",
            actor_id=actor_id or booked_via,
            details={
                "patient_id": patient_id,
                "doctor_id": doctor_id,
                "booked_via": booked_via,
            },
            call_id=call_id,
        )

    async def log_appointment_rescheduled(
        self, appointment_id: str, old_date: str, old_time: str,
        new_date: str, new_time: str, actor_id: str = None,
    ):
        await self.log(
            action="appointment_rescheduled",
            resource_type="appointment",
            resource_id=appointment_id,
            actor_type="user",
            actor_id=actor_id,
            details={
                "old_date": old_date, "old_time": old_time,
                "new_date": new_date, "new_time": new_time,
            },
        )

    async def log_appointment_cancelled(
        self, appointment_id: str, reason: str = "", actor_id: str = None,
    ):
        await self.log(
            action="appointment_cancelled",
            resource_type="appointment",
            resource_id=appointment_id,
            actor_type="user",
            actor_id=actor_id,
            details={"reason": reason},
        )

    async def log_call_started(self, call_id: str, caller_phone: str, source: str = "telephony"):
        await self.log(
            action="call_started",
            resource_type="call",
            resource_id=call_id,
            actor_type="voice_agent",
            details={"caller_phone": caller_phone, "source": source},
            call_id=call_id,
        )

    async def log_call_ended(self, call_id: str, duration: int = 0, intent: str = None):
        await self.log(
            action="call_ended",
            resource_type="call",
            resource_id=call_id,
            actor_type="voice_agent",
            details={"duration_seconds": duration, "intent": intent},
            call_id=call_id,
        )

    async def log_patient_created(self, patient_id: str, created_via: str = "dashboard"):
        await self.log(
            action="patient_created",
            resource_type="patient",
            resource_id=patient_id,
            actor_type="voice_agent" if created_via == "voice" else "user",
            details={"created_via": created_via},
        )

    async def log_ehr_sync(
        self, sync_type: str, entity_id: str, status: str, error: str = None,
    ):
        await self.log(
            action=f"ehr_sync_{sync_type}",
            resource_type="ehr_sync",
            resource_id=entity_id,
            actor_type="system",
            status=status,
            error_message=error,
        )

    async def log_auth_event(
        self, action: str, user_id: str = None, username: str = None,
        ip_address: str = None, success: bool = True,
    ):
        await self.log(
            action=action,
            resource_type="auth",
            actor_type="user",
            actor_id=user_id,
            actor_name=username,
            ip_address=ip_address,
            status="success" if success else "failure",
        )

    # ── Query Methods ────────────────────────────────────────────────

    async def get_recent_logs(
        self, limit: int = 50, resource_type: str = None, action: str = None,
    ) -> list[AuditLog]:
        query = {}
        if resource_type:
            query["resource_type"] = resource_type
        if action:
            query["action"] = action
        return await AuditLog.find(query).sort("-timestamp").limit(limit).to_list()

    async def get_logs_for_resource(self, resource_type: str, resource_id: str) -> list[AuditLog]:
        return await AuditLog.find(
            AuditLog.resource_type == resource_type,
            AuditLog.resource_id == resource_id,
        ).sort("-timestamp").to_list()

    async def get_logs_for_call(self, call_id: str) -> list[AuditLog]:
        return await AuditLog.find(AuditLog.call_id == call_id).sort("-timestamp").to_list()


# Singleton
audit_service = AuditService()
