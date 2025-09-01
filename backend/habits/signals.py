from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
import asyncio
import logging

from .models import Mission, Habit, Checkin, Mood
from ai_services.langgraph_service import langgraph_ai_service

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Mission)
def generate_mission_embeddings(sender, instance, created, **kwargs):
    """Generate embeddings for Mission skill and weakness fields"""
    if not langgraph_ai_service.ai_available:
        return
        
    def generate_embeddings():
        try:
            # Generate embeddings for skill
            if instance.skill and not instance.skill_embedding:
                skill_embedding = langgraph_ai_service.generate_text_embedding_sync(instance.skill)
                if skill_embedding:
                    instance.skill_embedding = skill_embedding
            
            # Generate embeddings for weakness
            if instance.weakness and not instance.weakness_embedding:
                weakness_embedding = langgraph_ai_service.generate_text_embedding_sync(instance.weakness)
                if weakness_embedding:
                    instance.weakness_embedding = weakness_embedding
            
            # Save if embeddings were generated
            if instance.skill_embedding or instance.weakness_embedding:
                Mission.objects.filter(pk=instance.pk).update(
                    skill_embedding=instance.skill_embedding,
                    weakness_embedding=instance.weakness_embedding
                )
                logger.info(f"Generated embeddings for Mission {instance.pk}")
                
        except Exception as e:
            logger.error(f"Error generating Mission embeddings: {str(e)}")
    
    # Run embedding generation in background thread to avoid blocking
    transaction.on_commit(generate_embeddings)


@receiver(post_save, sender=Habit)
def generate_habit_embeddings(sender, instance, created, **kwargs):
    """Generate embeddings for Habit title and anchor fields"""
    if not langgraph_ai_service.ai_available:
        return
        
    def generate_embeddings():
        try:
            # Generate embeddings for title
            if instance.title and not instance.title_embedding:
                title_embedding = langgraph_ai_service.generate_text_embedding_sync(instance.title)
                if title_embedding:
                    instance.title_embedding = title_embedding
            
            # Generate embeddings for anchor
            if instance.anchor and not instance.anchor_embedding:
                anchor_embedding = langgraph_ai_service.generate_text_embedding_sync(instance.anchor)
                if anchor_embedding:
                    instance.anchor_embedding = anchor_embedding
            
            # Save if embeddings were generated
            if instance.title_embedding or instance.anchor_embedding:
                Habit.objects.filter(pk=instance.pk).update(
                    title_embedding=instance.title_embedding,
                    anchor_embedding=instance.anchor_embedding
                )
                logger.info(f"Generated embeddings for Habit {instance.pk}")
                
        except Exception as e:
            logger.error(f"Error generating Habit embeddings: {str(e)}")
    
    transaction.on_commit(generate_embeddings)


@receiver(post_save, sender=Checkin)
def generate_checkin_embeddings(sender, instance, created, **kwargs):
    """Generate embeddings for Checkin note field"""
    if not langgraph_ai_service.ai_available:
        return
        
    def generate_embeddings():
        try:
            # Generate embeddings for note
            if instance.note and not instance.note_embedding:
                note_embedding = langgraph_ai_service.generate_text_embedding_sync(instance.note)
                if note_embedding:
                    Checkin.objects.filter(pk=instance.pk).update(
                        note_embedding=note_embedding
                    )
                    logger.info(f"Generated embeddings for Checkin {instance.pk}")
                
        except Exception as e:
            logger.error(f"Error generating Checkin embeddings: {str(e)}")
    
    transaction.on_commit(generate_embeddings)


@receiver(post_save, sender=Mood)
def generate_mood_embeddings(sender, instance, created, **kwargs):
    """Generate embeddings for Mood note field"""
    if not langgraph_ai_service.ai_available:
        return
        
    def generate_embeddings():
        try:
            # Generate embeddings for note
            if instance.note and not instance.note_embedding:
                note_embedding = langgraph_ai_service.generate_text_embedding_sync(instance.note)
                if note_embedding:
                    Mood.objects.filter(pk=instance.pk).update(
                        note_embedding=note_embedding
                    )
                    logger.info(f"Generated embeddings for Mood {instance.pk}")
                
        except Exception as e:
            logger.error(f"Error generating Mood embeddings: {str(e)}")
    
    transaction.on_commit(generate_embeddings)