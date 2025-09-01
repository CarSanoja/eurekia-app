from django.urls import path
from . import views

urlpatterns = [
    path('auth/join/', views.JoinView.as_view(), name='auth-join'),
    path('auth/otp/', views.RequestOTPView.as_view(), name='auth-otp'),
    path('auth/verify/', views.VerifyOTPView.as_view(), name='auth-verify'),
    path('users/me/', views.ProfileView.as_view(), name='profile'),
    path('contacts/', views.ContactMethodListCreateView.as_view(), name='contacts'),
    path('contacts/<uuid:pk>/', views.ContactMethodUpdateView.as_view(), name='contact-update'),
    path('channels/preferences/', views.ChannelPreferenceView.as_view(), name='channel-preferences'),
]