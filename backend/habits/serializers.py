from rest_framework import serializers
from .models import Mission, Vision, Habit, Checkin, Mood, Trigger, EnvPledge, PlanIfThen, Badge


class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = ['id', 'skill', 'weakness', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class VisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vision
        fields = ['id', 'tags', 'summary', 'image_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class HabitSerializer(serializers.ModelSerializer):
    current_streak = serializers.SerializerMethodField()
    streak_stats = serializers.SerializerMethodField()
    insurance_available = serializers.SerializerMethodField()
    can_use_insurance = serializers.SerializerMethodField()
    comeback_status = serializers.SerializerMethodField()
    motivational_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Habit
        fields = [
            'id', 'title', 'cadence', 'difficulty_level', 'anchor', 
            'micro_habit', 'is_active', 'order', 'current_streak',
            'streak_stats', 'insurance_available', 'can_use_insurance',
            'comeback_status', 'motivational_message', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'current_streak', 'streak_stats', 'insurance_available', 
            'can_use_insurance', 'comeback_status', 'motivational_message',
            'created_at', 'updated_at'
        ]
    
    def get_current_streak(self, obj):
        return obj.get_current_streak()
    
    def get_streak_stats(self, obj):
        return obj.get_streak_stats()
    
    def get_insurance_available(self, obj):
        return obj.get_insurance_count()
    
    def get_can_use_insurance(self, obj):
        return obj.can_use_insurance()
    
    def get_comeback_status(self, obj):
        return obj.get_comeback_status()
    
    def get_motivational_message(self, obj):
        return obj.get_motivational_message()


class CheckinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checkin
        fields = [
            'id', 'date', 'value', 'note', 'used_insurance', 
            'channel', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = ['id', 'date', 'score', 'note', 'channel', 'created_at']
        read_only_fields = ['id', 'created_at']


class TriggerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trigger
        fields = ['id', 'text', 'response', 'tags', 'created_at']
        read_only_fields = ['id', 'created_at']


class EnvPledgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnvPledge
        fields = [
            'id', 'text', 'cadence', 'last_checkin_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PlanIfThenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanIfThen
        fields = [
            'id', 'situation', 'action', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'type', 'awarded_at', 'metadata']
        read_only_fields = ['id', 'awarded_at']