from rest_framework import serializers
from .models import OutboundMessage, InboundMessage, ConsentLog, MessageTemplate
from accounts.models import ChannelPreference


class OutboundMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboundMessage
        fields = [
            'id', 'channel', 'template_key', 'payload_json', 'status', 
            'provider_msg_id', 'error_message', 'sent_at', 'created_at'
        ]
        read_only_fields = ['id', 'sent_at', 'created_at', 'provider_msg_id', 'error_message']


class InboundMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = InboundMessage
        fields = [
            'id', 'channel', 'text', 'parsed_intent', 'meta_json', 'processed', 
            'created_at'
        ]
        read_only_fields = ['id', 'parsed_intent', 'meta_json', 'processed', 'created_at']


class ChannelPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelPreference
        fields = [
            'id', 'channel', 'primary', 'allow_prompts', 'quiet_hours',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ConsentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsentLog
        fields = [
            'id', 'channel', 'action', 'source', 'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MessageTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageTemplate
        fields = [
            'id', 'key', 'name', 'channel', 'subject', 'body', 'variables',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']