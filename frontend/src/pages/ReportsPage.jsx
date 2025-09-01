import React from 'react';
import { AIReportCard } from '../components/reports/AIReportCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📊 Your Hero Analytics
          </h1>
          <p className="text-gray-600 text-lg">
            Get AI-powered insights about your amazing journey! 🚀
          </p>
        </div>

        {/* Quick Stats Overview */}
        <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-green-700 flex items-center justify-center gap-2">
              ⚡ Quick Stats
            </CardTitle>
            <CardDescription>
              Your progress at a glance! 📈
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600">Active Quests</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-orange-600">12</div>
                <div className="text-sm text-gray-600">Longest Streak</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-green-600">87%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600">Hero Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Report */}
          <AIReportCard type="progress" />
          
          {/* Hero Report */}
          <AIReportCard type="hero" />
        </div>

        {/* Coming Soon */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              🚀 More Analytics Coming Soon!
            </CardTitle>
            <CardDescription>
              We're working on even more awesome insights for you! 🔨
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-60">
                <div className="text-2xl mb-2">📅</div>
                <div className="text-sm text-gray-600">Weekly Trends</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-60">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm text-gray-600">Achievement Gallery</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-60">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm text-gray-600">Habit Correlation</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-60">
                <div className="text-2xl mb-2">🎯</div>
                <div className="text-sm text-gray-600">Goal Predictions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Info */}
        <Card className="bg-gradient-to-br from-indigo-50 to-cyan-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              🤖 About Your AI Coach
            </CardTitle>
            <CardDescription>
              Meet Quanta, your personal habit-building assistant! 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="text-6xl">🤖</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Hi! I'm Quanta, your AI habit coach! ✨
                </h3>
                <p className="text-gray-600 mb-4">
                  I analyze your habit data to give you personalized insights, encouragement, and recommendations. 
                  I'm here to help you become the best version of yourself! 💪
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-indigo-600">🧠 Smart Analysis</div>
                    <div className="text-gray-600">I learn from your patterns</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-indigo-600">💡 Personal Tips</div>
                    <div className="text-gray-600">Custom advice just for you</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-indigo-600">🎉 Celebration</div>
                    <div className="text-gray-600">I cheer for your wins!</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;