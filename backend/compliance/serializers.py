from rest_framework import serializers
from .models import ComplianceRule, Verification
from professionals.serializers import CredentialSerializer

class ComplianceRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplianceRule
        fields = '__all__'

class VerificationSerializer(serializers.ModelSerializer):
    verifier_name = serializers.ReadOnlyField(source='verifier.get_full_name')
    credential_details = CredentialSerializer(source='credential', read_only=True)

    class Meta:
        model = Verification
        fields = '__all__'
