from rest_framework import serializers
from .models import Shift, ShiftTemplate, Recurrence, Offer, Application, Waitlist
from professionals.serializers import ProfessionalProfileSerializer

class ShiftSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    facility_name = serializers.ReadOnlyField(source='department.facility.name')
    facility_id = serializers.ReadOnlyField(source='department.facility.id')
    assigned_professional_name = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = '__all__'

    def get_assigned_professional_name(self, obj):
        if obj.assigned_professional and obj.assigned_professional.user:
            return obj.assigned_professional.user.get_full_name()
        return None

class OfferSerializer(serializers.ModelSerializer):
    professional_name = serializers.ReadOnlyField(source='professional.user.get_full_name')
    shift_details = ShiftSerializer(source='shift', read_only=True)

    class Meta:
        model = Offer
        fields = '__all__'

class ShiftTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftTemplate
        fields = '__all__'
