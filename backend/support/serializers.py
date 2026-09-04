from rest_framework import serializers
from .models import SupportCase, Message, Notification

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.get_full_name')

    class Meta:
        model = Message
        fields = '__all__'

class SupportCaseSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.get_full_name')
    assigned_agent_name = serializers.ReadOnlyField(source='assigned_agent.get_full_name')
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = SupportCase
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
