import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../../utils/toast';

export function NotificationSettings() {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState([]);

  // Fetch channel preferences
  const { data: channelPrefs, isLoading } = useQuery({
    queryKey: ['channelPreferences'],
    queryFn: async () => {
      const response = await api.get('/channels/preferences/');
      return response.data;
    },
  });

  // Fetch notification stats
  const { data: notificationStats } = useQuery({
    queryKey: ['notificationStats'],
    queryFn: async () => {
      const response = await api.get('/notifications/stats/');
      return response.data;
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updatedPreferences) => {
      const response = await api.put('/channels/preferences/', updatedPreferences);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['channelPreferences']);
      toast.success('🎉 Notification preferences updated!');
    },
    onError: (error) => {
      toast.error('Failed to update preferences. Please try again.');
      console.error('Error updating preferences:', error);
    },
  });

  useEffect(() => {
    if (channelPrefs) {
      setPreferences(channelPrefs);
    }
  }, [channelPrefs]);

  const handlePreferenceChange = (channel, field, value) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.channel === channel 
          ? { ...pref, [field]: value }
          : pref
      )
    );
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gradient-to-r from-blue-100 to-green-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      {notificationStats && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              📊 Your Notification Stats
            </CardTitle>
            <CardDescription>
              Keep track of your quest notifications! 🎮
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {notificationStats.total_sent}
                </div>
                <div className="text-sm text-gray-600">Messages Sent ✅</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-red-500">
                  {notificationStats.total_failed}
                </div>
                <div className="text-sm text-gray-600">Failed ❌</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {notificationStats.last_30_days}
                </div>
                <div className="text-sm text-gray-600">Last 30 Days 📅</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {notificationStats.total_queued}
                </div>
                <div className="text-sm text-gray-600">Queued ⏳</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card className="bg-gradient-to-br from-pink-50 to-orange-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            🔔 Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize how and when you want to receive quest reminders! 🚀
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {preferences.map((pref) => (
            <div key={pref.channel} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {pref.channel === 'email' ? '📧' : 
                     pref.channel === 'web' ? '🌐' : 
                     pref.channel === 'telegram' ? '📱' : '💬'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 capitalize">
                      {pref.channel} Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pref.channel === 'email' && 'Get quest reminders and achievements in your inbox!'}
                      {pref.channel === 'web' && 'See notifications when you visit Quanta!'}
                      {pref.channel === 'telegram' && 'Get instant reminders on Telegram!'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pref.primary}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange(pref.channel, 'primary', checked)
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`prompts-${pref.channel}`} className="text-sm font-medium">
                    🎯 Allow Quest Reminders
                  </Label>
                  <Switch
                    id={`prompts-${pref.channel}`}
                    checked={pref.allow_prompts}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange(pref.channel, 'allow_prompts', checked)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`quiet-${pref.channel}`} className="text-sm font-medium mb-2 block">
                    🌙 Quiet Hours (when to pause notifications)
                  </Label>
                  <Input
                    id={`quiet-${pref.channel}`}
                    value={pref.quiet_hours}
                    onChange={(e) => 
                      handlePreferenceChange(pref.channel, 'quiet_hours', e.target.value)
                    }
                    placeholder="22:00-08:00"
                    className="bg-gray-50 border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: HH:MM-HH:MM (e.g., 22:00-08:00 for 10 PM to 8 AM)
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave}
              disabled={updatePreferencesMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {updatePreferencesMutation.isPending ? '💾 Saving...' : '💾 Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}