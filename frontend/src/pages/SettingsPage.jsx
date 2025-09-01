import React from 'react';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            ⚙️ Quest Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Customize your hero journey experience! 🚀
          </p>
        </div>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-green-700 flex items-center justify-center gap-2">
              🎮 Your Hero Status
            </CardTitle>
            <CardDescription>
              Keep building those epic habits! 💪
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold text-orange-600">Active</div>
                <div className="text-sm text-gray-600">Quest Status</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-2xl font-bold text-blue-600">Ready</div>
                <div className="text-sm text-gray-600">Notifications</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">🌟</div>
                <div className="text-2xl font-bold text-purple-600">Hero</div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSettings />

        {/* Additional Settings Placeholder */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              🎯 More Settings Coming Soon!
            </CardTitle>
            <CardDescription>
              We're working on more awesome customization options! 🔨
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-60">
                <div className="text-2xl mb-2">🎨</div>
                <div className="text-sm text-gray-600">Themes</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-60">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-60">
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm text-gray-600">Friends</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm opacity-60">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm text-gray-600">Privacy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}