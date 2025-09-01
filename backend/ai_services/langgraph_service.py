import os
import json
import logging
from typing import Dict, Any, List, Optional, TypedDict, Annotated
from datetime import datetime, timedelta

from django.conf import settings
from django.utils import timezone
import numpy as np

logger = logging.getLogger(__name__)

# Import AI dependencies with fallbacks
try:
    from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
    from langchain_core.prompts import PromptTemplate
    from langgraph.graph import StateGraph, END, START
    from langgraph.prebuilt import ToolNode
    from typing_extensions import TypedDict
    LANGGRAPH_AVAILABLE = True
except ImportError:
    logger.warning("LangGraph or dependencies not available. Using fallback.")
    LANGGRAPH_AVAILABLE = False
    
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    logger.warning("Google Generative AI not available.")
    GENAI_AVAILABLE = False


# State definitions for LangGraph workflows
class ProgressAnalysisState(TypedDict):
    """State for progress analysis workflow"""
    user_id: str
    habits_data: Dict[str, Any]
    analysis_type: str
    context: Dict[str, Any]
    insights: List[Dict[str, Any]]
    recommendations: List[str]
    motivational_message: str
    final_report: Dict[str, Any]
    

class EmbeddingState(TypedDict):
    """State for text embedding workflow"""
    text: str
    embedding: Optional[List[float]]
    error: Optional[str]


class LangGraphAIService:
    """Enhanced AI Service using LangGraph for complex workflows and Gemini Flash for speed"""
    
    def __init__(self):
        self.ai_available = LANGGRAPH_AVAILABLE and GENAI_AVAILABLE
        
        # Initialize Gemini Flash (faster, cheaper model)
        api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if api_key and LANGGRAPH_AVAILABLE:
            self.llm = GoogleGenerativeAI(
                model="gemini-1.5-flash-002",  # Use Flash for speed
                google_api_key=api_key,
                temperature=0.7,
                max_output_tokens=2048
            )
            
            # Initialize embeddings model
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=api_key
            )
        else:
            self.llm = None
            self.embeddings = None
            
        # Build workflow graphs
        self._build_progress_analysis_graph()
        self._build_embedding_graph()
        
        self.max_tokens_per_request = 4000  # Flash model limits
    
    def _build_progress_analysis_graph(self):
        """Build the progress analysis workflow graph"""
        if not self.ai_available:
            return
            
        # Create the state graph
        workflow = StateGraph(ProgressAnalysisState)
        
        # Add nodes
        workflow.add_node("analyze_context", self._analyze_context_node)
        workflow.add_node("generate_insights", self._generate_insights_node) 
        workflow.add_node("create_recommendations", self._create_recommendations_node)
        workflow.add_node("generate_motivation", self._generate_motivation_node)
        workflow.add_node("compile_report", self._compile_report_node)
        
        # Add edges
        workflow.add_edge(START, "analyze_context")
        workflow.add_edge("analyze_context", "generate_insights")
        workflow.add_edge("generate_insights", "create_recommendations")
        workflow.add_edge("create_recommendations", "generate_motivation")
        workflow.add_edge("generate_motivation", "compile_report")
        workflow.add_edge("compile_report", END)
        
        # Compile the graph
        self.progress_graph = workflow.compile()
    
    def _build_embedding_graph(self):
        """Build the text embedding workflow graph"""
        if not self.ai_available:
            return
            
        workflow = StateGraph(EmbeddingState)
        
        workflow.add_node("generate_embedding", self._generate_embedding_node)
        
        workflow.add_edge(START, "generate_embedding")
        workflow.add_edge("generate_embedding", END)
        
        self.embedding_graph = workflow.compile()
    
    async def generate_progress_report(self, user, habits_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive progress report using LangGraph workflow"""
        try:
            if not self.ai_available:
                return self._create_fallback_report(user, habits_data)
            
            # Initialize state
            initial_state = ProgressAnalysisState(
                user_id=str(user.id),
                habits_data=habits_data,
                analysis_type="progress_report",
                context={},
                insights=[],
                recommendations=[],
                motivational_message="",
                final_report={}
            )
            
            # Run the workflow
            result = await self.progress_graph.ainvoke(initial_state)
            
            # Track usage (estimate tokens)
            self._track_usage(user, 1500, 'progress_report_langgraph')
            
            return result["final_report"]
            
        except Exception as e:
            logger.error(f"Error in LangGraph progress report: {str(e)}")
            return self._create_fallback_report(user, habits_data)
    
    async def generate_text_embedding(self, text: str) -> Optional[List[float]]:
        """Generate text embedding using Gemini embeddings"""
        try:
            if not self.ai_available or not text.strip():
                return None
                
            # Initialize state
            initial_state = EmbeddingState(
                text=text,
                embedding=None,
                error=None
            )
            
            # Run embedding workflow
            result = await self.embedding_graph.ainvoke(initial_state)
            
            if result.get("error"):
                logger.error(f"Embedding error: {result['error']}")
                return None
                
            return result.get("embedding")
            
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return None
    
    def generate_text_embedding_sync(self, text: str) -> Optional[List[float]]:
        """Synchronous version of text embedding generation"""
        try:
            if not self.ai_available or not text.strip():
                return None
                
            # Use embeddings directly for sync operation
            embedding = self.embeddings.embed_query(text)
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating sync embedding: {str(e)}")
            return None
    
    # Workflow Node Functions
    async def _analyze_context_node(self, state: ProgressAnalysisState) -> ProgressAnalysisState:
        """Analyze the context of user's habit data"""
        try:
            habits_data = state["habits_data"]
            
            # Extract key metrics
            context = {
                "total_habits": habits_data.get('total_habits', 0),
                "completion_rate": habits_data.get('overall_completion_rate', 0),
                "longest_streak": habits_data.get('longest_streak', 0),
                "current_streaks": habits_data.get('current_streaks', []),
                "difficulty_distribution": habits_data.get('difficulty_levels', {}),
                "recent_patterns": habits_data.get('weekly_pattern', {}),
                "user_age_group": "teen"  # Assume teen for now
            }
            
            state["context"] = context
            return state
            
        except Exception as e:
            logger.error(f"Error in analyze_context_node: {str(e)}")
            state["context"] = {}
            return state
    
    async def _generate_insights_node(self, state: ProgressAnalysisState) -> ProgressAnalysisState:
        """Generate insights using LLM"""
        try:
            context = state["context"]
            completion_rate = context.get("completion_rate", 0)
            
            prompt = f"""
            You are Quanta, an AI coach for teens building habits. Analyze this data and generate 3 key insights:
            
            User Data:
            - Total habits: {context.get('total_habits', 0)}
            - Completion rate: {completion_rate:.1f}%
            - Longest streak: {context.get('longest_streak', 0)} days
            - Current streaks: {context.get('current_streaks', [])}
            
            Provide exactly 3 insights as a JSON array with this format:
            [
              {{"type": "strength|challenge|pattern", "title": "Brief title", "description": "Detailed insight", "confidence": 0.8}}
            ]
            
            Be encouraging and focus on teen-friendly language with emojis.
            """
            
            response = await self.llm.ainvoke(prompt)
            
            # Parse insights from response
            insights = self._parse_insights_from_response(response)
            state["insights"] = insights
            
        except Exception as e:
            logger.error(f"Error in generate_insights_node: {str(e)}")
            state["insights"] = self._get_fallback_insights(state["context"])
            
        return state
    
    async def _create_recommendations_node(self, state: ProgressAnalysisState) -> ProgressAnalysisState:
        """Create actionable recommendations"""
        try:
            context = state["context"]
            insights = state["insights"]
            
            prompt = f"""
            Based on these insights about a teen's habits, create 3-5 specific, actionable recommendations:
            
            Context: {json.dumps(context, indent=2)}
            Insights: {json.dumps(insights, indent=2)}
            
            Provide recommendations as a JSON array of strings. Keep them:
            - Specific and actionable
            - Teen-friendly language
            - Encouraging tone
            - Include relevant emojis
            
            Format: ["Recommendation 1", "Recommendation 2", ...]
            """
            
            response = await self.llm.ainvoke(prompt)
            recommendations = self._parse_recommendations_from_response(response)
            state["recommendations"] = recommendations
            
        except Exception as e:
            logger.error(f"Error in create_recommendations_node: {str(e)}")
            state["recommendations"] = self._get_fallback_recommendations(state["context"])
            
        return state
    
    async def _generate_motivation_node(self, state: ProgressAnalysisState) -> ProgressAnalysisState:
        """Generate personalized motivational message"""
        try:
            context = state["context"]
            completion_rate = context.get("completion_rate", 0)
            
            prompt = f"""
            Create a motivational message for a teen with {completion_rate:.1f}% habit completion rate.
            
            Make it:
            - Personal and encouraging  
            - Age-appropriate for teens
            - Include relevant emoji
            - 1-2 sentences max
            - Celebrate progress, not perfection
            
            Just return the message directly, no formatting.
            """
            
            response = await self.llm.ainvoke(prompt)
            state["motivational_message"] = response.strip()
            
        except Exception as e:
            logger.error(f"Error in generate_motivation_node: {str(e)}")
            state["motivational_message"] = self._get_fallback_motivation(state["context"])
            
        return state
    
    async def _compile_report_node(self, state: ProgressAnalysisState) -> ProgressAnalysisState:
        """Compile final report from all components"""
        try:
            report = {
                "title": "Your Progress Report",
                "summary": f"You've completed {state['context'].get('completion_rate', 0):.1f}% of your habits this period!",
                "completion_rate": state["context"].get("completion_rate", 0),
                "insights": state["insights"],
                "recommendations": state["recommendations"], 
                "motivational_message": state["motivational_message"],
                "generated_at": timezone.now().isoformat(),
                "analysis_method": "langgraph_workflow"
            }
            
            state["final_report"] = report
            
        except Exception as e:
            logger.error(f"Error in compile_report_node: {str(e)}")
            state["final_report"] = self._create_emergency_fallback_report()
            
        return state
    
    async def _generate_embedding_node(self, state: EmbeddingState) -> EmbeddingState:
        """Generate embedding for text"""
        try:
            text = state["text"]
            
            if not text.strip():
                state["error"] = "Empty text provided"
                return state
                
            # Generate embedding using Gemini embeddings
            embedding = await self.embeddings.aembed_query(text)
            state["embedding"] = embedding
            
        except Exception as e:
            error_msg = f"Error generating embedding: {str(e)}"
            logger.error(error_msg)
            state["error"] = error_msg
            
        return state
    
    # Helper methods
    def _parse_insights_from_response(self, response: str) -> List[Dict[str, Any]]:
        """Parse insights from LLM response"""
        try:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                insights_json = json_match.group()
                insights = json.loads(insights_json)
                return insights[:3]  # Limit to 3 insights
        except Exception as e:
            logger.error(f"Error parsing insights: {str(e)}")
            
        # Fallback parsing
        return [
            {
                "type": "general",
                "title": "Keep Going!",
                "description": "You're making progress on your habit journey! 🌟",
                "confidence": 0.8
            }
        ]
    
    def _parse_recommendations_from_response(self, response: str) -> List[str]:
        """Parse recommendations from LLM response"""
        try:
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                recs_json = json_match.group()
                recommendations = json.loads(recs_json)
                return recommendations[:5]  # Limit to 5
        except Exception:
            pass
            
        # Fallback - split by lines and clean up
        lines = [line.strip() for line in response.split('\n') if line.strip()]
        return lines[:3] if lines else ["Keep building those awesome habits! 🎯"]
    
    def _get_fallback_insights(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate fallback insights when AI fails"""
        completion_rate = context.get("completion_rate", 0)
        
        if completion_rate >= 80:
            return [
                {
                    "type": "strength",
                    "title": "Consistency Champion!",
                    "description": f"You're absolutely crushing it with {completion_rate:.1f}% completion! 🏆",
                    "confidence": 1.0
                }
            ]
        elif completion_rate >= 60:
            return [
                {
                    "type": "strength", 
                    "title": "Strong Progress!",
                    "description": f"Great work with {completion_rate:.1f}% completion rate! 💪",
                    "confidence": 0.9
                }
            ]
        else:
            return [
                {
                    "type": "encouragement",
                    "title": "Every Step Counts!",
                    "description": "You're building the foundation for amazing habits! 🌟",
                    "confidence": 0.8
                }
            ]
    
    def _get_fallback_recommendations(self, context: Dict[str, Any]) -> List[str]:
        """Generate fallback recommendations"""
        return [
            "Start small and be consistent 🎯",
            "Celebrate every single win! 🎉", 
            "Focus on one habit at a time 💪",
            "Set up helpful reminders 📱"
        ]
    
    def _get_fallback_motivation(self, context: Dict[str, Any]) -> str:
        """Generate fallback motivational message"""
        completion_rate = context.get("completion_rate", 0)
        if completion_rate >= 70:
            return "You're doing amazing! Keep up that incredible momentum! 🚀"
        else:
            return "Every hero starts somewhere - you're building something great! 🌟"
    
    def _create_fallback_report(self, user, habits_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create fallback report when AI is unavailable"""
        completion_rate = habits_data.get('overall_completion_rate', 0)
        
        return {
            "title": f"Progress Report",
            "summary": f"You've completed {completion_rate:.1f}% of your habits!",
            "completion_rate": completion_rate,
            "insights": [
                {
                    "type": "general",
                    "title": "Keep Going!",
                    "description": "Every day you're building stronger habits! 💪",
                    "confidence": 0.8
                }
            ],
            "recommendations": [
                "Focus on consistency over perfection 🎯",
                "Celebrate your progress! 🎉",
                "Small steps lead to big wins 🌟"
            ],
            "motivational_message": "You're doing great! Keep building those amazing habits! 🚀",
            "generated_at": timezone.now().isoformat(),
            "analysis_method": "fallback"
        }
    
    def _create_emergency_fallback_report(self) -> Dict[str, Any]:
        """Emergency fallback when everything fails"""
        return {
            "title": "Progress Report",
            "summary": "Keep building those awesome habits!",
            "completion_rate": 0,
            "insights": [],
            "recommendations": ["Stay consistent!", "Celebrate small wins!"],
            "motivational_message": "You're amazing! Keep going! 🌟",
            "generated_at": timezone.now().isoformat(),
            "analysis_method": "emergency_fallback"
        }
    
    def _track_usage(self, user, estimated_tokens: int, operation: str):
        """Track AI usage"""
        logger.info(f"AI usage: user={user.email}, operation={operation}, tokens={estimated_tokens}")
        # TODO: Implement database tracking


# Initialize the service
langgraph_ai_service = LangGraphAIService()