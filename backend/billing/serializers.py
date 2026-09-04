from rest_framework import serializers
from .models import Rate, Incentive, Budget, Invoice, Payment, Adjustment, TaxDocument
from shifts.serializers import ShiftSerializer

class InvoiceSerializer(serializers.ModelSerializer):
    facility_name = serializers.ReadOnlyField(source='facility.name')

    class Meta:
        model = Invoice
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    professional_name = serializers.ReadOnlyField(source='professional.user.get_full_name')
    shift_details = ShiftSerializer(source='shift', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

class AdjustmentSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source='actor.get_full_name')

    class Meta:
        model = Adjustment
        fields = '__all__'

class TaxDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxDocument
        fields = '__all__'
