"""
Advanced Email Templates for Aha Moments
Highly aesthetic, responsive, and kid-friendly designs
"""
import logging
from datetime import datetime
from django.utils import timezone

logger = logging.getLogger(__name__)

class EmailTemplates:
    """Advanced HTML email templates with modern design"""
    
    @staticmethod
    def get_base_template():
        """Base template with common styles and structure"""
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>{title}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    line-height: 1.6;
                    background: linear-gradient(135deg, {bg_gradient});
                    margin: 0;
                    padding: 20px;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                }
                
                .header {
                    background: linear-gradient(135deg, {header_gradient});
                    padding: 40px 40px 0;
                    text-align: center;
                    color: white;
                }
                
                .logo {
                    font-size: 64px;
                    margin-bottom: 20px;
                    animation: float 3s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                .header h1 {
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 0 15px 0;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                .header p {
                    font-size: 18px;
                    font-weight: 400;
                    margin: 0;
                    opacity: 0.95;
                }
                
                .hero-wave {
                    height: 60px;
                    background: linear-gradient(135deg, {header_gradient});
                    position: relative;
                }
                
                .hero-wave::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 60px;
                    background: #ffffff;
                    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
                }
                
                .content {
                    padding: 40px;
                }
                
                .highlight-box {
                    background: linear-gradient(135deg, {accent_gradient});
                    border-radius: 20px;
                    padding: 30px;
                    margin: 30px 0;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .highlight-box::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    animation: shimmer 3s linear infinite;
                }
                
                @keyframes shimmer {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .highlight-box h2 {
                    color: white;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 15px 0;
                    position: relative;
                    z-index: 1;
                }
                
                .highlight-box p {
                    color: white;
                    font-size: 16px;
                    margin: 0;
                    position: relative;
                    z-index: 1;
                }
                
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 18px;
                    margin: 20px 0;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
                }
                
                .progress-bar {
                    background: #f0f0f0;
                    border-radius: 20px;
                    height: 12px;
                    margin: 20px 0;
                    overflow: hidden;
                }
                
                .progress-fill {
                    background: linear-gradient(90deg, #11998e, #38ef7d);
                    height: 100%;
                    border-radius: 20px;
                    animation: progress-grow 2s ease-in-out;
                }
                
                @keyframes progress-grow {
                    from { width: 0%; }
                    to { width: var(--progress-width, 50%); }
                }
                
                .stats-grid {
                    display: flex;
                    gap: 20px;
                    margin: 30px 0;
                    flex-wrap: wrap;
                }
                
                .stat-card {
                    flex: 1;
                    min-width: 140px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 16px;
                    text-align: center;
                    box-shadow: 0 8px 20px rgba(240, 147, 251, 0.3);
                }
                
                .stat-number {
                    font-size: 32px;
                    font-weight: 800;
                    line-height: 1;
                    margin-bottom: 8px;
                }
                
                .stat-label {
                    font-size: 14px;
                    font-weight: 500;
                    opacity: 0.9;
                }
                
                .footer {
                    background: #f8fafc;
                    padding: 30px 40px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                
                .footer p {
                    color: #64748b;
                    font-size: 14px;
                    margin: 10px 0;
                }
                
                .social-links {
                    margin: 20px 0;
                }
                
                .social-links a {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 50%;
                    text-decoration: none;
                    margin: 0 5px;
                    line-height: 40px;
                    font-size: 16px;
                }
                
                /* Mobile Responsive */
                @media (max-width: 600px) {
                    .email-container {
                        margin: 0;
                        border-radius: 0;
                    }
                    
                    .header, .content, .footer {
                        padding: 30px 20px;
                    }
                    
                    .stats-grid {
                        flex-direction: column;
                    }
                    
                    .stat-card {
                        min-width: auto;
                    }
                }
                
                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .email-container {
                        background: #1a202c;
                        color: #e2e8f0;
                    }
                    
                    .footer {
                        background: #2d3748;
                    }
                }
                
                .badge-showcase {
                    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
                    border-radius: 20px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                    position: relative;
                    overflow: hidden;
                }
                
                .badge-icon {
                    font-size: 80px;
                    margin-bottom: 15px;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
                    animation: bounce 2s infinite;
                }
                
                @keyframes bounce {
                    0%, 20%, 53%, 80%, 100% {
                        animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
                        transform: translate3d(0,0,0);
                    }
                    40%, 43% {
                        animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                        transform: translate3d(0, -10px, 0);
                    }
                    70% {
                        animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
                        transform: translate3d(0, -5px, 0);
                    }
                    90% {
                        transform: translate3d(0,-2px,0);
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                {content}
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def welcome_hero(user_name, context=None):
        """Welcome email for new users"""
        content = f"""
        <div class="header">
            <div class="logo">🚀</div>
            <h1>Welcome to Quanta, {user_name}!</h1>
            <p>Your epic hero journey starts now</p>
        </div>
        <div class="hero-wave"></div>
        
        <div class="content">
            <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px;">Ready to Build Amazing Habits? 🎯</h2>
            
            <p style="font-size: 16px; color: #4a5568; margin-bottom: 25px;">
                Hey there, future hero! 👋 We're so excited you've joined the Quanta family. 
                You're about to embark on an incredible journey of building habits that will transform you into the awesome person you're meant to be!
            </p>
            
            <div class="highlight-box" style="--bg-gradient: #667eea 0%, #764ba2 100%">
                <h2>🎮 How It Works</h2>
                <p>Think of habits as quests! Complete your daily quests, build epic streaks, and unlock amazing badges. Every small action counts toward becoming your best self!</p>
            </div>
            
            <div style="background: #f7fafc; border-radius: 16px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #2d3748; font-size: 20px; margin-bottom: 15px;">🌟 What's Next?</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin: 12px 0; font-size: 16px; color: #4a5568;">
                        <span style="color: #667eea; font-weight: 600;">1.</span> Create your first quest (habit)
                    </li>
                    <li style="margin: 12px 0; font-size: 16px; color: #4a5568;">
                        <span style="color: #667eea; font-weight: 600;">2.</span> Complete it daily to build your streak
                    </li>
                    <li style="margin: 12px 0; font-size: 16px; color: #4a5568;">
                        <span style="color: #667eea; font-weight: 600;">3.</span> Unlock badges and level up!
                    </li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="https://quanta.app" class="cta-button">
                    🚀 Start Your First Quest
                </a>
            </div>
            
            <p style="text-align: center; color: #718096; font-size: 16px; margin-top: 30px;">
                Remember: Every hero started with a single step. You've got this! 💪
            </p>
        </div>
        
        <div class="footer">
            <p style="font-weight: 600; color: #4a5568;">Welcome to the Quanta family! 🎉</p>
            <p>We're here to support you on your journey to greatness.</p>
            <div class="social-links">
                <a href="#">📧</a>
                <a href="#">💬</a>
                <a href="#">📱</a>
            </div>
            <p style="font-size: 12px; margin-top: 20px;">
                Questions? Just reply to this email - we're always happy to help! 😊
            </p>
        </div>
        """
        
        return EmailTemplates.get_base_template().format(
            title="Welcome to Quanta",
            content=content,
            bg_gradient="#667eea 0%, #764ba2 100%",
            header_gradient="#667eea 0%, #764ba2 100%",
            accent_gradient="#667eea 0%, #764ba2 100%"
        )
    
    @staticmethod
    def first_habit_created(user_name, habit_title, context=None):
        """Email sent when user creates their first habit"""
        content = f"""
        <div class="header">
            <div class="logo">🎯</div>
            <h1>Your First Quest is Ready!</h1>
            <p>Let's make this habit stick, {user_name}</p>
        </div>
        <div class="hero-wave"></div>
        
        <div class="content">
            <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px;">Awesome Work Creating Your First Habit! 🎉</h2>
            
            <div class="highlight-box" style="--bg-gradient: #11998e 0%, #38ef7d 100%">
                <h2>🎮 Your Quest</h2>
                <p style="font-size: 20px; font-weight: 600;">"{habit_title}"</p>
                <p>This is going to be epic! 🚀</p>
            </div>
            
            <p style="font-size: 16px; color: #4a5568; margin: 25px 0;">
                You just took the most important step - starting! Creating your first habit is like choosing your first quest in a video game. 
                Now comes the fun part: building an epic streak! 🔥
            </p>
            
            <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 16px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #744210; font-size: 20px; margin-bottom: 15px;">💡 Pro Tips for Success</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin: 12px 0; color: #744210; font-size: 16px;">
                        ✨ <strong>Start small:</strong> Even 1 minute counts as a win!
                    </li>
                    <li style="margin: 12px 0; color: #744210; font-size: 16px;">
                        ⏰ <strong>Same time daily:</strong> Pick a consistent time
                    </li>
                    <li style="margin: 12px 0; color: #744210; font-size: 16px;">
                        🏆 <strong>Celebrate wins:</strong> Every check-in is a victory!
                    </li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <p style="font-size: 18px; color: #2d3748; margin-bottom: 20px;">
                    Ready to complete your first quest? 🎯
                </p>
                <a href="https://quanta.app" class="cta-button">
                    ✅ Complete Today's Quest
                </a>
            </div>
            
            <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #234e52; font-size: 16px; margin: 0;">
                    <strong>💌 Heads up!</strong> We'll send you a gentle reminder tomorrow to help you build that streak. 
                    You can adjust these in your settings anytime!
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p style="font-weight: 600; color: #4a5568;">You're off to an amazing start! 🌟</p>
            <p>Remember: progress over perfection, always!</p>
            <p style="font-size: 12px; margin-top: 20px;">
                Need help or have questions? Just reply to this email! 📧
            </p>
        </div>
        """
        
        return EmailTemplates.get_base_template().format(
            title="First Quest Created",
            content=content,
            bg_gradient="#11998e 0%, #38ef7d 100%",
            header_gradient="#11998e 0%, #38ef7d 100%",
            accent_gradient="#11998e 0%, #38ef7d 100%"
        )
    
    @staticmethod
    def first_week_milestone(user_name, habit_title, streak_days, context=None):
        """Celebrate first week milestone"""
        content = f"""
        <div class="header">
            <div class="logo">🔥</div>
            <h1>{streak_days} Days Strong!</h1>
            <p>You're absolutely crushing it, {user_name}</p>
        </div>
        <div class="hero-wave"></div>
        
        <div class="content">
            <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px;">INCREDIBLE! You Hit Your First Week! 🎉</h2>
            
            <div class="badge-showcase">
                <div class="badge-icon">🏆</div>
                <h2 style="color: #744210; font-size: 28px; margin: 0;">Week Warrior Badge Unlocked!</h2>
                <p style="color: #744210; font-size: 18px; margin-top: 10px;">7 days of pure dedication!</p>
            </div>
            
            <p style="font-size: 16px; color: #4a5568; margin: 25px 0;">
                Stop everything and celebrate! 🎉 You just completed 7 consecutive days of "{habit_title}" - 
                that's absolutely amazing! Most people give up after just 3 days, but not you. You're proving that you have what it takes to be a true habit hero!
            </p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">{streak_days}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div class="stat-number">100%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                    <div class="stat-number">∞</div>
                    <div class="stat-label">Potential</div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 25px; margin: 25px 0; color: white; text-align: center;">
                <h3 style="font-size: 22px; margin-bottom: 15px;">🚀 What This Means</h3>
                <p style="font-size: 16px; margin: 0; opacity: 0.95;">
                    Research shows it takes 21 days to form a habit. You're already 1/3 of the way there! 
                    Your brain is literally rewiring itself to make this habit automatic. Keep going - you're building something incredible!
                </p>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="--progress-width: 33%; background: linear-gradient(90deg, #667eea, #764ba2);"></div>
            </div>
            <p style="text-align: center; color: #718096; font-size: 14px; margin-top: 10px;">
                33% to habit mastery (21 days)
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
                <p style="font-size: 18px; color: #2d3748; margin-bottom: 20px;">
                    Ready to extend that epic streak? 🔥
                </p>
                <a href="https://quanta.app" class="cta-button">
                    ⚡ Keep The Streak Alive!
                </a>
            </div>
            
            <div style="background: #fff5f5; border: 2px solid #fed7d7; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                <h4 style="color: #c53030; font-size: 18px; margin-bottom: 10px;">💪 Challenge Accepted?</h4>
                <p style="color: #742a2a; font-size: 16px; margin: 0;">
                    Can you make it to 14 days? We believe in you! Let's see that streak grow even longer! 🚀
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p style="font-weight: 600; color: #4a5568;">You're officially a Week Warrior! 🏆</p>
            <p>Keep going, hero - greatness awaits!</p>
            <p style="font-size: 12px; margin-top: 20px;">
                Share your victory with friends and family - you've earned it! 🎉
            </p>
        </div>
        """
        
        return EmailTemplates.get_base_template().format(
            title="Week Warrior Achievement",
            content=content,
            bg_gradient="#667eea 0%, #764ba2 100%",
            header_gradient="#f093fb 0%, #f5576c 100%",
            accent_gradient="#667eea 0%, #764ba2 100%"
        )
    
    @staticmethod
    def streak_recovery(user_name, habit_title, broken_streak, context=None):
        """Supportive email when streak breaks"""
        content = f"""
        <div class="header">
            <div class="logo">💪</div>
            <h1>Every Hero Has Setbacks</h1>
            <p>Let's bounce back stronger, {user_name}</p>
        </div>
        <div class="hero-wave"></div>
        
        <div class="content">
            <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px;">Your {broken_streak}-Day Streak Was Amazing! 🌟</h2>
            
            <p style="font-size: 16px; color: #4a5568; margin: 25px 0;">
                Hey champion! 👋 First things first - let's celebrate that incredible {broken_streak}-day streak you built with "{habit_title}". 
                That was absolutely phenomenal! You proved you have the power to build amazing habits.
            </p>
            
            <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 16px; padding: 25px; margin: 25px 0; text-align: center;">
                <h3 style="color: #744210; font-size: 20px; margin-bottom: 15px;">🎯 Here's The Truth</h3>
                <p style="color: #744210; font-size: 16px; margin: 0;">
                    Breaking a streak doesn't erase your progress. Those {broken_streak} days of growth are still part of you! 
                    Every single day you completed that habit made you stronger, and that doesn't disappear. 💛
                </p>
            </div>
            
            <div style="background: #e6fffa; border-radius: 16px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #234e52; font-size: 20px; margin-bottom: 15px;">🚀 Comeback Champions</h3>
                <p style="color: #234e52; font-size: 16px; margin-bottom: 15px;">
                    Did you know that the most successful habit-builders aren't the ones who never break streaks? 
                    They're the ones who bounce back the fastest! Here's how to make your comeback epic:
                </p>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    <li style="margin: 10px 0; color: #234e52; font-size: 16px;">
                        🔄 <strong>Start today:</strong> Don't wait for Monday or next month
                    </li>
                    <li style="margin: 10px 0; color: #234e52; font-size: 16px;">
                        📏 <strong>Go smaller:</strong> Make it even easier to win
                    </li>
                    <li style="margin: 10px 0; color: #234e52; font-size: 16px;">
                        🎯 <strong>Focus on today:</strong> Just win this one day
                    </li>
                </ul>
            </div>
            
            <div class="highlight-box" style="--bg-gradient: #667eea 0%, #764ba2 100%">
                <h2>💎 The Comeback Streak</h2>
                <p>Your next streak is going to be even better because you're wiser now. You know what works, what doesn't, and you're ready to level up!</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <p style="font-size: 18px; color: #2d3748; margin-bottom: 20px;">
                    Ready to start your comeback story? 🎬
                </p>
                <a href="https://quanta.app" class="cta-button">
                    🔥 Begin Comeback Streak
                </a>
            </div>
            
            <div style="background: #fff5f5; border-left: 4px solid #f56565; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: #c53030; font-size: 18px; margin-bottom: 10px;">💝 Remember</h4>
                <p style="color: #742a2a; font-size: 16px; margin: 0;">
                    "Fall seven times, stand up eight." You've got this, hero. The best comeback stories start with getting back up. 
                    We believe in you 100%! 🌟
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p style="font-weight: 600; color: #4a5568;">Comebacks are the best stories! 📖</p>
            <p>You're not starting over - you're starting better.</p>
            <p style="font-size: 12px; margin-top: 20px;">
                Need support or want to share your comeback? Reply to this email - we're cheering you on! 📣
            </p>
        </div>
        """
        
        return EmailTemplates.get_base_template().format(
            title="Comeback Time",
            content=content,
            bg_gradient="#ffecd2 0%, #fcb69f 100%",
            header_gradient="#ffecd2 0%, #fcb69f 100%",
            accent_gradient="#667eea 0%, #764ba2 100%"
        )
    
    @staticmethod
    def badge_unlock(user_name, badge_name, badge_type, context=None):
        """Badge unlock celebration email"""
        badge_emojis = {
            'foundation': '🏗️',
            'consistency': '🔥',
            'streak_7': '⚡',
            'streak_30': '💎',
            'comeback': '🎯',
            'mission_complete': '👑'
        }
        
        badge_emoji = badge_emojis.get(badge_type, '🏆')
        
        content = f"""
        <div class="header">
            <div class="logo">{badge_emoji}</div>
            <h1>Achievement Unlocked!</h1>
            <p>You earned the {badge_name} badge!</p>
        </div>
        <div class="hero-wave"></div>
        
        <div class="content">
            <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px;">Incredible Work, {user_name}! 🎉</h2>
            
            <div class="badge-showcase">
                <div class="badge-icon">{badge_emoji}</div>
                <h2 style="color: #744210; font-size: 32px; margin: 0;">{badge_name}</h2>
                <p style="color: #744210; font-size: 18px; margin-top: 10px;">Badge Unlocked!</p>
            </div>
            
            <p style="font-size: 16px; color: #4a5568; margin: 25px 0; text-align: center;">
                Stop everything and celebrate! 🎊 You just unlocked a special badge that represents your dedication, 
                consistency, and awesome progress. This isn't just a digital trophy - it's proof of your commitment to becoming your best self!
            </p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 25px; margin: 25px 0; color: white; text-align: center;">
                <h3 style="font-size: 22px; margin-bottom: 15px;">🌟 What This Badge Means</h3>
                <p style="font-size: 16px; margin: 0; opacity: 0.95;">
                    You've demonstrated real commitment and consistency. This badge is a symbol of your growth mindset and dedication to building better habits. Wear it with pride, hero!
                </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <p style="font-size: 18px; color: #2d3748; margin-bottom: 20px;">
                    Ready to earn your next badge? 🏆
                </p>
                <a href="https://quanta.app" class="cta-button">
                    🚀 Keep Building Habits
                </a>
            </div>
            
            <div style="background: #fff5f5; border: 2px solid #fed7d7; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                <h4 style="color: #c53030; font-size: 18px; margin-bottom: 10px;">🎯 Next Challenge</h4>
                <p style="color: #742a2a; font-size: 16px; margin: 0;">
                    There are more badges waiting for you to unlock! Keep up your amazing habits and see what other achievements you can earn!
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p style="font-weight: 600; color: #4a5568;">Congratulations on your new badge! 🏆</p>
            <p>You're building something truly special!</p>
            <p style="font-size: 12px; margin-top: 20px;">
                Share your achievement with friends - you've earned the bragging rights! 🎉
            </p>
        </div>
        """
        
        return EmailTemplates.get_base_template().format(
            title="Badge Unlocked",
            content=content,
            bg_gradient="#f093fb 0%, #f5576c 100%",
            header_gradient="#f093fb 0%, #f5576c 100%",
            accent_gradient="#667eea 0%, #764ba2 100%"
        )
    
    @staticmethod
    def get_template_by_key(template_key, **kwargs):
        """Get template by key with parameters"""
        templates = {
            'welcome_hero': EmailTemplates.welcome_hero,
            'first_habit_created': EmailTemplates.first_habit_created,
            'first_week_milestone': EmailTemplates.first_week_milestone,
            'streak_recovery': EmailTemplates.streak_recovery,
            'badge_unlock': EmailTemplates.badge_unlock,
        }
        
        template_func = templates.get(template_key)
        if template_func:
            return template_func(**kwargs)
        
        logger.error(f"Unknown email template: {template_key}")
        return None