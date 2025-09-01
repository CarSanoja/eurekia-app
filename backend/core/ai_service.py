import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# Try to import AI dependencies, fallback if not available
try:
    from pydantic import BaseModel, Field
    PYDANTIC_AVAILABLE = True
except ImportError:
    logger.warning("Pydantic not available. Using simple data structures.")
    PYDANTIC_AVAILABLE = False
    BaseModel = object
    def Field(*args, **kwargs):
        return None

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
    # Configure Gemini API
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if api_key:
        genai.configure(api_key=api_key)
except ImportError:
    logger.warning("Google Generative AI not available. AI features will use fallback responses.")
    genai = None
    GENAI_AVAILABLE = False


if PYDANTIC_AVAILABLE:
    class ProgressInsight(BaseModel):
        """Structured output for progress insights."""
        insight_type: str = Field(description="Type of insight: 'strength', 'challenge', 'recommendation'")
        title: str = Field(description="Brief title for the insight")
        description: str = Field(description="Detailed description")
        confidence: float = Field(description="Confidence score 0-1", ge=0, le=1)
        action_items: List[str] = Field(description="Suggested action items", default=[])

    class WeeklyReport(BaseModel):
        """Structured output for weekly report generation."""
        title: str = Field(description="Report title")
        summary: str = Field(description="Overall progress summary")
        completion_rate: float = Field(description="Overall completion percentage")
        insights: List[ProgressInsight] = Field(description="Key insights")
        motivational_message: str = Field(description="Kid-friendly motivational message")
        recommendations: List[str] = Field(description="Specific recommendations")
else:
    # Simple fallback classes
    class ProgressInsight:
        def __init__(self, insight_type=None, title=None, description=None, confidence=0.8, action_items=None):
            self.insight_type = insight_type
            self.title = title
            self.description = description
            self.confidence = confidence
            self.action_items = action_items or []

    class WeeklyReport:
        def __init__(self, title=None, summary=None, completion_rate=0, insights=None, motivational_message=None, recommendations=None):
            self.title = title
            self.summary = summary
            self.completion_rate = completion_rate
            self.insights = insights or []
            self.motivational_message = motivational_message
            self.recommendations = recommendations or []


class AIService:
    """AI service for generating insights and reports using Google Gemini."""
    
    def __init__(self):
        self.ai_available = GENAI_AVAILABLE and getattr(settings, 'GEMINI_API_KEY', '')
        
        if self.ai_available and genai:
            # Initialize the model
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            
        self.max_tokens_per_request = 8000  # Conservative limit for Gemini Pro
    
    def track_usage(self, user, tokens_used: int, operation: str):
        """Track AI usage for monitoring and billing."""
        # For now, just log the usage - we can implement database tracking later
        logger.info(f"AI usage: user={user.email}, operation={operation}, tokens={tokens_used}")
        # TODO: Implement AIUsage model when needed
        pass
    
    def _count_tokens(self, text: str) -> int:
        """Estimate token count for text."""
        # Rough estimation: ~4 characters per token for English
        return len(text) // 4
    
    def _truncate_if_needed(self, text: str, max_tokens: int = 6000) -> str:
        """Truncate text if it exceeds token limit."""
        estimated_tokens = self._count_tokens(text)
        if estimated_tokens > max_tokens:
            # Keep roughly the token limit in characters
            char_limit = max_tokens * 4
            return text[:char_limit] + "... [truncated]"
        return text
    
    def generate_progress_report(self, user, habits_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered progress report for user habits."""
        try:
            # Prepare context data
            context = self._prepare_habits_context(habits_data)
            context_str = json.dumps(context, indent=2)
            context_str = self._truncate_if_needed(context_str)
            
            # Create prompt
            system_prompt = """You are Quanta, a friendly AI coach for kids and teens who helps them build great habits. 
            You're enthusiastic, encouraging, and use kid-friendly language with emojis. 
            Analyze the habit data and provide insights that will motivate and guide the user.
            
            Focus on:
            - Celebrating successes and progress
            - Identifying patterns and trends
            - Giving actionable, age-appropriate advice
            - Being encouraging even when progress is slow
            - Using gamification language (quests, levels, achievements)
            
            User age range: 8-18 years old
            Tone: Encouraging, fun, supportive
            Language: Simple, clear, with appropriate emojis"""
            
            user_prompt = f"""Analyze this habit tracking data and generate insights:

            User: {user.name}
            Data: {context_str}
            
            Please provide:
            1. Overall progress summary
            2. Key strengths and achievements
            3. Areas for improvement
            4. Specific, actionable recommendations
            5. A motivational message
            
            Keep it positive and encouraging! 🌟
            
            Please format your response as a brief, encouraging report suitable for a teenager."""
            
            # Generate with Gemini if available
            if self.ai_available and self.model:
                full_prompt = f"{system_prompt}\n\n{user_prompt}"
                response = self.model.generate_content(full_prompt)
                
                if not response.text:
                    raise Exception("Empty response from AI model")
                
                response_text = response.text
                
                # Track usage
                tokens_used = self._count_tokens(context_str + response_text)
                self.track_usage(user, tokens_used, 'progress_report')
            else:
                # Fallback response when AI is not available
                completion_rate = context.get('overall_completion_rate', 0)
                if completion_rate >= 80:
                    response_text = f"Amazing progress, {user.name}! You've completed {completion_rate:.1f}% of your habits - you're absolutely crushing it! 🌟 Your consistency is incredible and shows real dedication to becoming your best self. Keep up this fantastic momentum!"
                elif completion_rate >= 60:
                    response_text = f"Great work, {user.name}! With a {completion_rate:.1f}% completion rate, you're building some awesome habits! 💪 You're showing real commitment and every day you're getting stronger. Focus on consistency and celebrate these wins!"
                elif completion_rate >= 40:
                    response_text = f"You're making solid progress, {user.name}! At {completion_rate:.1f}% completion, you're building the foundation for great habits! 🚀 Remember that every hero's journey has ups and downs - what matters is that you keep going!"
                else:
                    response_text = f"Hey {user.name}, every hero starts somewhere! You're at the beginning of your journey and that's exactly where you need to be! 💪 Focus on small, consistent actions and celebrate every single win, no matter how small!"
            
            # Create structured report from response
            report = {
                "title": f"Progress Report for {user.name}",
                "summary": response_text,
                "completion_rate": context.get('overall_completion_rate', 0),
                "insights": self._extract_insights_from_text(response_text),
                "motivational_message": self._extract_motivational_message(response_text),
                "recommendations": self._extract_recommendations(response_text)
            }
            
            logger.info(f"Generated progress report for user {user.email}")
            return report
            
        except Exception as e:
            logger.error(f"Error generating progress report: {str(e)}")
            # Return fallback report
            return self._create_fallback_report(user, habits_data)
    
    def generate_habit_insights(self, user, habit_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate insights for a specific habit."""
        try:
            context = self._prepare_habit_context(habit_data)
            context_str = json.dumps(context, indent=2)
            context_str = self._truncate_if_needed(context_str)
            
            prompt = f"""You are Quanta, a helpful AI coach for young habit builders. 
            Analyze habit performance and provide 2-3 specific, actionable insights.
            Be encouraging and use kid-friendly language with emojis.

            Analyze this habit data and provide insights:

            Habit: {habit_data.get('title', 'Your Habit')}
            Data: {context_str}
            
            Provide 2-3 brief insights with:
            - What's going well
            - What could be improved
            - Specific suggestions
            
            Keep it encouraging! 🎯"""
            
            response = self.model.generate_content(prompt)
            
            if not response.text:
                raise Exception("Empty response from AI model")
            
            # Parse insights from response
            insights = self._parse_habit_insights(response.text)
            
            # Track usage
            tokens_used = self._count_tokens(context_str + response.text)
            self.track_usage(user, tokens_used, 'habit_insights')
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating habit insights: {str(e)}")
            return self._create_fallback_insights(habit_data)
    
    def generate_motivational_message(self, user, context: str = "") -> str:
        """Generate a personalized motivational message."""
        try:
            prompt = f"""You are Quanta, an enthusiastic AI coach for kids and teens.
            Generate a short, personalized motivational message (1-2 sentences).
            Be encouraging, use emojis, and match the user's energy level.

            Generate a motivational message for {user.name}.
            Context: {context or "Building awesome habits"}
            
            Make it personal, encouraging, and fun! 🚀"""
            
            if self.ai_available and self.model:
                response = self.model.generate_content(prompt)
                
                if not response.text:
                    raise Exception("Empty response from AI model")
                
                message = response.text.strip()
                
                # Track usage
                tokens_used = self._count_tokens(context + message)
                self.track_usage(user, tokens_used, 'motivational_message')
            else:
                # Fallback motivational messages
                messages = [
                    f"You're doing amazing, {user.name}! Every step counts! 🌟",
                    f"Keep going, {user.name}! You're building something incredible! 💪",
                    f"Great job staying consistent, {user.name}! You're a true hero! 🚀",
                    f"Your progress is inspiring, {user.name}! Keep up the fantastic work! 🎉",
                    f"Every day you're getting stronger, {user.name}! Proud of you! ⭐"
                ]
                import random
                message = random.choice(messages)
            
            return message
            
        except Exception as e:
            logger.error(f"Error generating motivational message: {str(e)}")
            return f"Keep being awesome, {user.name}! You're building amazing habits! 🌟"
    
    def _extract_insights_from_text(self, text: str) -> List[Dict[str, Any]]:
        """Extract insights from AI response text."""
        insights = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        for line in lines[:3]:  # Max 3 insights
            if any(keyword in line.lower() for keyword in ['strength', 'achievement', 'well', 'good', 'great']):
                insights.append({
                    "insight_type": "strength",
                    "title": "Great Work!",
                    "description": line,
                    "confidence": 0.8
                })
            elif any(keyword in line.lower() for keyword in ['improve', 'challenge', 'better', 'focus', 'try']):
                insights.append({
                    "insight_type": "recommendation",
                    "title": "Growth Opportunity",
                    "description": line,
                    "confidence": 0.7
                })
        
        return insights[:3]  # Limit to 3 insights
    
    def _extract_motivational_message(self, text: str) -> str:
        """Extract motivational message from AI response."""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        for line in lines:
            if any(emoji in line for emoji in ['🌟', '💪', '🚀', '🎉', '⭐', '🔥']):
                return line
        
        # Fallback to first line with encouraging words
        for line in lines:
            if any(word in line.lower() for word in ['awesome', 'great', 'amazing', 'fantastic', 'incredible']):
                return line
        
        return "Keep up the amazing work! Every step counts! 🌟"
    
    def _extract_recommendations(self, text: str) -> List[str]:
        """Extract recommendations from AI response."""
        recommendations = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        for line in lines:
            if any(starter in line.lower() for starter in ['try', 'consider', 'you could', 'suggestion', 'recommend']):
                recommendations.append(line)
        
        if not recommendations:
            # Fallback recommendations
            recommendations = [
                "Keep building those awesome habits! 🎯",
                "Stay consistent - small steps lead to big wins! 💪",
                "Remember to celebrate your progress! 🎉"
            ]
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def _prepare_habits_context(self, habits_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare habit data for AI analysis."""
        context = {
            "total_habits": habits_data.get('total_habits', 0),
            "active_habits": habits_data.get('active_habits', 0),
            "completion_rate_7d": habits_data.get('completion_rate_7d', 0),
            "completion_rate_30d": habits_data.get('completion_rate_30d', 0),
            "longest_streak": habits_data.get('longest_streak', 0),
            "current_streaks": habits_data.get('current_streaks', []),
            "recent_checkins": habits_data.get('recent_checkins', []),
            "difficulty_levels": habits_data.get('difficulty_levels', []),
            "weekly_pattern": habits_data.get('weekly_pattern', {}),
            "overall_completion_rate": habits_data.get('overall_completion_rate', 0)
        }
        return context
    
    def _prepare_habit_context(self, habit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare single habit data for analysis."""
        context = {
            "title": habit_data.get('title', ''),
            "cadence": habit_data.get('cadence', 'daily'),
            "current_streak": habit_data.get('current_streak', 0),
            "longest_streak": habit_data.get('longest_streak', 0),
            "completion_rate": habit_data.get('completion_rate', 0),
            "recent_checkins": habit_data.get('recent_checkins', []),
            "difficulty_level": habit_data.get('difficulty_level', 1)
        }
        return context
    
    def _parse_habit_insights(self, content: str) -> List[Dict[str, Any]]:
        """Parse insights from AI response."""
        # Simple parsing - split by lines and create insights
        insights = []
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        
        for i, line in enumerate(lines[:3]):  # Max 3 insights
            if line:
                insights.append({
                    "type": "recommendation",
                    "title": f"Insight {i+1}",
                    "description": line,
                    "confidence": 0.8
                })
        
        return insights
    
    def _create_fallback_report(self, user, habits_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a basic fallback report when AI fails."""
        completion_rate = habits_data.get('overall_completion_rate', 0)
        
        if completion_rate >= 80:
            message = f"Amazing work, {user.name}! You're absolutely crushing it! 🏆"
        elif completion_rate >= 60:
            message = f"Great progress, {user.name}! You're building fantastic habits! 🌟"
        elif completion_rate >= 40:
            message = f"Nice effort, {user.name}! Every step counts on your journey! 💪"
        else:
            message = f"Hey {user.name}, every hero starts somewhere! Let's build those habits together! 🚀"
        
        return {
            "title": f"Progress Report for {user.name}",
            "summary": f"You've completed {completion_rate:.1f}% of your habit goals. Keep up the great work!",
            "completion_rate": completion_rate,
            "insights": [],
            "motivational_message": message,
            "recommendations": [
                "Try starting with small, easy habits first 🎯",
                "Set reminders to help you remember 📱",
                "Celebrate your wins, no matter how small! 🎉"
            ]
        }
    
    def _create_fallback_insights(self, habit_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create fallback insights when AI fails."""
        title = habit_data.get('title', 'Your habit')
        streak = habit_data.get('current_streak', 0)
        
        insights = []
        
        if streak > 0:
            insights.append({
                "type": "strength",
                "title": "Great Streak!",
                "description": f"You've kept up {title} for {streak} days! That's awesome! 🔥",
                "confidence": 1.0
            })
        
        insights.append({
            "type": "recommendation",
            "title": "Keep Going!",
            "description": f"Stay consistent with {title} - you're building something amazing! 💪",
            "confidence": 0.9
        })
        
        return insights


# Initialize the AI service instance
ai_service = AIService()