from django.urls import path
from . import views

urlpatterns = [
    path('messages/send/', views.SendMessageView.as_view(), name='send-message'),
    path('messages/outbound/', views.OutboundMessageListView.as_view(), name='outbound-messages'),
]