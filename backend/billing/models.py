from django.db import models
from django.conf import settings
from core.models import Facility, Department
from professionals.models import ProfessionalProfile
from shifts.models import Shift
from core.managers import LockedModelManager, TenantScopedManager

class Rate(models.Model):
    """
    Standard base bill rates by role, specialty, and time band.
    """
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='rates')
    role = models.CharField(max_length=50)
    specialty = models.CharField(max_length=100)
    day_rate = models.DecimalField(max_digits=8, decimal_places=2)
    night_rate = models.DecimalField(max_digits=8, decimal_places=2)
    weekend_rate = models.DecimalField(max_digits=8, decimal_places=2)
    holiday_rate = models.DecimalField(max_digits=8, decimal_places=2)

class Incentive(models.Model):
    """
    Surge pricing or hard-to-fill shift bonus modifiers.
    """
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    trigger_type = models.CharField(max_length=50, choices=[('short_notice', 'Short Notice (<24h)'), ('weekend', 'Weekend Critical'), ('acuity_surge', 'High Acuity Surge')])

class Budget(models.Model):
    """
    Departmental spending allocation cap per financial period.
    """
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='budgets')
    period = models.CharField(max_length=50, help_text="e.g. 2026-Q3, 2026-SEP")
    cap = models.DecimalField(max_digits=12, decimal_places=2)
    spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    """
    Facility invoice grouping billable completed shifts.
    Protected at the QuerySet level from in-place edits when approved/paid.
    """
    INVOICE_STATUSES = [
        ('draft', 'Draft'),
        ('issued', 'Issued / Pending Approval'),
        ('approved', 'Approved & Locked'),
        ('paid', 'Paid'),
        ('disputed', 'Disputed'),
    ]

    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    period_start = models.DateField()
    period_end = models.DateField()
    line_items = models.JSONField(default=list)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=INVOICE_STATUSES, default='issued')
    aging_bucket = models.CharField(max_length=20, default='current', choices=[('current', '0-30 Days'), ('31_60', '31-60 Days'), ('61_90', '61-90 Days'), ('90_plus', '90+ Days Past Due')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = LockedModelManager()

    def __str__(self):
        return f"Invoice {self.invoice_number} ({self.facility.name}) - ${self.total_amount} [{self.status}]"

class Payment(models.Model):
    """
    Remittance disbursement made to a healthcare professional for completed shifts.
    Enforces DB uniqueness constraint on (professional, shift, payment_type) to prevent double-payment.
    """
    PAYMENT_STATUSES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved & Queued'),
        ('instant_dispatched', 'Dispatched via Instant Pay'),
        ('remitted', 'Remitted / Completed'),
        ('failed', 'Failed'),
    ]

    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='payments')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='payments')
    payment_type = models.CharField(max_length=30, default='shift_wages', choices=[('shift_wages', 'Shift Wages'), ('incentive_bonus', 'Incentive Bonus'), ('expense_reimbursement', 'Expense Reimbursement')])
    gross_amount = models.DecimalField(max_digits=8, decimal_places=2)
    deductions = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=30, choices=PAYMENT_STATUSES, default='pending')
    method = models.CharField(max_length=30, default='direct_deposit', choices=[('direct_deposit', 'Direct Deposit / BACS'), ('instant_pay', 'Instant Pay (Stripe/Card)')])
    remitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('professional', 'shift', 'payment_type')
        indexes = [
            models.Index(fields=['professional', 'status']),
        ]

    def __str__(self):
        return f"Payment #{self.id}: {self.professional.user.get_full_name()} - ${self.net_amount} [{self.status}]"

class Adjustment(models.Model):
    """
    Exception-safe financial ledger entry.
    All post-approval changes to payments or invoices MUST create an Adjustment record
    referencing the immutable original.
    """
    original_invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='adjustments')
    original_payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name='adjustments')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_adjustments')
    amount = models.DecimalField(max_digits=8, decimal_places=2, help_text="Can be positive or negative credit")
    reason = models.TextField(help_text="Detailed audit justification for financial delta")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Adjustment #{self.id}: ${self.amount} by {self.actor} (Reason: {self.reason[:30]}...)"

class TaxDocument(models.Model):
    """
    Annual or periodic earnings statement (e.g. W-2, 1099, P60).
    """
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='tax_documents')
    tax_year = models.PositiveSmallIntegerField(default=2026)
    doc_type = models.CharField(max_length=30, default='1099-NEC')
    file = models.FileField(upload_to='tax_documents/%Y/', null=True, blank=True)
    gross_ytd = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
