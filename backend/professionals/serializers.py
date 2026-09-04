from rest_framework import serializers
from .models import ProfessionalProfile, Qualification, Credential, Availability, Preference, Reference

class QualificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Qualification
        fields = '__all__'

class CredentialSerializer(serializers.ModelSerializer):
    qualification_name = serializers.ReadOnlyField(source='qualification.name')
    qualification_category = serializers.ReadOnlyField(source='qualification.category')

    class Meta:
        model = Credential
        fields = '__all__'

class ProfessionalProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField(source='user.get_full_name')
    email = serializers.ReadOnlyField(source='user.email')
    credentials = CredentialSerializer(many=True, read_only=True)

    class Meta:
        model = ProfessionalProfile
        fields = '__all__'

class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = '__all__'
