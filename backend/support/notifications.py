from typing import List, Any, Dict
from django.contrib.auth import get_user_model
from .models import Notification

class NotificationService:
    """
    Centralized event-driven notification dispatcher.
    Unifies in-app notification records, SMS alerts, and email notifications.
    """

    @classmethod
    def dispatch(cls, event_type: str, recipients: List[Any], payload: Dict[str, Any]):
        User = get_user_model()

        title = payload.get('title', f"Update: {event_type.replace('_', ' ').title()}")
        body = payload.get('message', f"Notification for event {event_type}")
        url = payload.get('action_url', '')

        for recipient in recipients:
            target_user = None
            if isinstance(recipient, User):
                target_user = recipient
            elif isinstance(recipient, int):
                target_user = User.objects.filter(id=recipient).first()
            elif isinstance(recipient, str):
                target_user = User.objects.filter(email=recipient).first()

            if target_user:
                Notification.objects.create(
                    recipient=target_user,
                    event_type=event_type,
                    title=title,
                    message=body,
                    action_url=url
                )
