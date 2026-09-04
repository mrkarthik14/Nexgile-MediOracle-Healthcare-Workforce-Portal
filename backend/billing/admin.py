from django.contrib import admin
from .models import Rate, Incentive, Budget, Invoice, Payment, Adjustment, TaxDocument

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'facility', 'total_amount', 'status', 'aging_bucket')
    list_filter = ('status', 'aging_bucket', 'facility')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'professional', 'shift', 'gross_amount', 'net_amount', 'status', 'method')
    list_filter = ('status', 'method')

@admin.register(Adjustment)
class AdjustmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'amount', 'actor', 'original_invoice', 'original_payment', 'created_at')
