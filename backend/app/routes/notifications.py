from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from datetime import datetime, timezone
from app.models.notification import Notification, NotificationResponse
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
):
    query = {
        "$or": [
            {"user_id": str(current_user.id)},
            {"user_id": None},
        ]
    }
    if unread_only:
        query["read"] = False

    notifs = (
        await Notification.find(query)
        .sort("-created_at")
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return [NotificationResponse.from_doc(n) for n in notifs]


@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    notif = await Notification.get(notification_id)
    if notif:
        notif.read = True
        await notif.save()
    return {"status": "ok"}


@router.put("/read-all")
async def mark_all_read(current_user: User = Depends(get_current_user)):
    await Notification.find(
        {
            "$or": [
                {"user_id": str(current_user.id)},
                {"user_id": None},
            ],
            "read": False,
        }
    ).update({"$set": {"read": True}})
    return {"status": "ok"}


@router.get("/unread-count")
async def unread_count(current_user: User = Depends(get_current_user)):
    count = await Notification.find(
        {
            "$or": [
                {"user_id": str(current_user.id)},
                {"user_id": None},
            ],
            "read": False,
        }
    ).count()
    return {"count": count}
