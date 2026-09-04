from rest_framework import serializers
from .models import MatchScore
from professionals.serializers import ProfessionalProfileSerializer

class MatchScoreSerializer(serializers.ModelSerializer):
    professional_details = ProfessionalProfileSerializer(source='professional', read_only=True)
    overridden_by_name = serializers.ReadOnlyField(source='overridden_by.get_full_name')

    class Meta:
        model = MatchScore
        fields = '__all__'
