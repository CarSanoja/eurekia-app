from django.urls import path
from . import views

urlpatterns = [
    path('messages/send/', views.SendMessageView.as_view(), name='send-message'),
    path('messages/outbound/', views.OutboundMessageListView.as_view(), name='outbound-messages'),
    path('contacts/', views.ContactMethodCreateView.as_view(), name='contact-create'),
    path('contacts/<int:pk>/', views.ContactMethodUpdateView.as_view(), name='contact-update'),
    path('channels/preferences/', views.ChannelPreferencesView.as_view(), name='channel-preferences'),
    path('habits/<int:habit_id>/reminder/', views.TriggerHabitReminderView.as_view(), name='trigger-reminder'),
    path('notifications/stats/', views.NotificationStatsView.as_view(), name='notification-stats'),
]