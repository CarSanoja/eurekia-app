from rest_framework import serializers
from .models import User, ContactMethod, ChannelPreference, Role, UserRole
from core.models import Course


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'avatar_icon', 'avatar_color', 
            'locale', 'class_code', 'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_active']


class JoinSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    class_code = serializers.CharField(max_length=50, required=False)
    
    def validate_class_code(self, value):
        if value:
            try:
                Course.objects.get(code=value, visibility='live')
            except Course.DoesNotExist:
                raise serializers.ValidationError("Invalid class code")
        return value


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)


class ContactMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMethod
        fields = [
            'id', 'channel', 'address', 'verified', 'consent', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'verified', 'created_at', 'updated_at']


class ChannelPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelPreference
        fields = [
            'id', 'primary', 'allow_prompts', 'quiet_hours', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'key', 'name', 'description']


class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'role', 'granted_at']
        read_only_fields = ['id', 'granted_at']