import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Your progress is saved! 💾')) {
      logout();
      navigate('/login');
    }
  };

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

        {/* User Profile Card */}
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-3xl">{user?.avatar_icon || '🦸'}</span>
                Hero Profile
              </span>
              <div className="flex items-center gap-2">
                {user?.is_staff && (
                  <button
                    onClick={() => navigate('/studio')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors text-sm flex items-center gap-1"
                  >
                    🔧 Admin Studio
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </CardTitle>
            <CardDescription>
              Your hero identity and journey details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600">Hero Name:</span>
                <span className="font-bold text-purple-700">{user?.name || 'Unknown Hero'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-purple-700">{user?.email || 'hero@example.com'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-purple-200">
                <span className="text-gray-600">Current Streak:</span>
                <span className="font-bold text-orange-600">🔥 {user?.current_streak || 0} days</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Badges Earned:</span>
                <span className="font-bold text-yellow-600">🏆 {user?.badges_earned || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Developer Info for Demo */}
        <Card className="bg-gray-100 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              🛠️ Demo Mode Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              You're currently in demo mode. All data is stored locally and will persist until you clear your browser storage.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-3 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Clear Local Data
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;