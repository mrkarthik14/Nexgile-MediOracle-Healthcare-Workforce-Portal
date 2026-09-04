from django.db import models
from django.conf import settings

class SupportCase(models.Model):
    """
    Helpdesk and clinical dispute ticket.
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High / Escalated'),
        ('urgent', 'Urgent / Shift Impasse'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('pending_user', 'Pending User Response'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    case_number = models.CharField(max_length=50, unique=True)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='requested_cases')
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_cases'
    )
    subject = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=[
        ('timesheet_dispute', 'Timesheet / Hours Dispute'),
        ('credential_rejection', 'Credential Rejection Inquiry'),
        ('shift_cancellation', 'Emergency Shift Cancellation'),
        ('payment_issue', 'Payment / Remittance Delay'),
        ('general', 'General Application Support'),
    ])
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    sla_due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.case_number}] {self.subject} ({self.status})"

class Message(models.Model):
    """
    Threaded message inside a SupportCase.
    """
    case = models.ForeignKey(SupportCase, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    is_internal_note = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    """
    System notification for critical operational and compliance events.
    """
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    event_type = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
