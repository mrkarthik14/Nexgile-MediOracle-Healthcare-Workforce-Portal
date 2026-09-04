from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, OrganizationMembership

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.primary_role
        token['name'] = user.get_full_name()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'primary_role': self.user.primary_role,
        }
        return data

class OrganizationMembershipSerializer(serializers.ModelSerializer):
    organization_name = serializers.ReadOnlyField(source='organization.name')
    facility_name = serializers.ReadOnlyField(source='facility.name')

    class Meta:
        model = OrganizationMembership
        fields = ('id', 'organization', 'organization_name', 'facility', 'facility_name', 'role', 'is_primary')

class UserSerializer(serializers.ModelSerializer):
    memberships = OrganizationMembershipSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'primary_role', 'avatar_url', 'memberships')
