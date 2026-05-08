"""
Celery Task Queue Configuration
================================
Handles async background tasks: EHR sync, notifications, analytics processing.
"""

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "aleem_ehr",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 min hard limit
    task_soft_time_limit=240,  # 4 min soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
    broker_connection_retry_on_startup=True,
    # Task routing
    task_routes={
        "app.tasks.ehr.*": {"queue": "ehr_sync"},
        "app.tasks.notifications.*": {"queue": "notifications"},
        "app.tasks.analytics.*": {"queue": "analytics"},
    },
    # Retry policy
    task_default_retry_delay=60,
    task_max_retries=5,
)

celery_app.autodiscover_tasks(["app.tasks"])
