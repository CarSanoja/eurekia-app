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
    
    class Meta:
        model = Habit
        fields = [
            'id', 'title', 'cadence', 'difficulty_level', 'anchor', 
            'micro_habit', 'is_active', 'order', 'current_streak',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_streak', 'created_at', 'updated_at']
    
    def get_current_streak(self, obj):
        return obj.get_current_streak()


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