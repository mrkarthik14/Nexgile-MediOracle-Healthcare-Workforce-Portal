from rest_framework import serializers
from .models import ClockEvent, Timesheet, Incident
from shifts.serializers import ShiftSerializer

class ClockEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClockEvent
        fields = '__all__'

class TimesheetSerializer(serializers.ModelSerializer):
    shift_details = ShiftSerializer(source='shift', read_only=True)
    approver_name = serializers.ReadOnlyField(source='approver.get_full_name')

    class Meta:
        model = Timesheet
        fields = '__all__'

class IncidentSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.get_full_name')

    class Meta:
        model = Incident
        fields = '__all__'
