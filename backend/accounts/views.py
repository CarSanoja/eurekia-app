from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
import random
import string
from .models import User, ContactMethod, ChannelPreference
from .serializers import (
    UserSerializer, JoinSerializer, OTPRequestSerializer, 
    OTPVerifySerializer, ContactMethodSerializer, ChannelPreferenceSerializer
)


class JoinView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(request=JoinSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = JoinSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            name = serializer.validated_data['name']
            class_code = serializer.validated_data.get('class_code')
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'name': name, 'class_code': class_code}
            )
            
            if not created:
                return Response(
                    {'detail': 'User already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RequestOTPView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(request=OTPRequestSerializer, responses={200: {'type': 'object'}})
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {'detail': 'User not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            otp = ''.join(random.choices(string.digits, k=6))
            cache_key = f'otp_{email}'
            cache.set(cache_key, otp, 300)  # 5 minutes expiry
            
            send_mail(
                subject='Your Quanta Login Code',
                message=f'Your login code is: {otp}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({'status': 'OTP sent'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(request=OTPVerifySerializer, responses={200: {'type': 'object'}})
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            
            cache_key = f'otp_{email}'
            cached_otp = cache.get(cache_key)
            
            if not cached_otp or cached_otp != code:
                return Response(
                    {'detail': 'Invalid or expired OTP'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                user = User.objects.get(email=email)
                user.last_login = timezone.now()
                user.save(update_fields=['last_login'])
            except User.DoesNotExist:
                return Response(
                    {'detail': 'User not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            cache.delete(cache_key)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ContactMethodListCreateView(ListCreateAPIView):
    serializer_class = ContactMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ContactMethod.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ContactMethodUpdateView(RetrieveUpdateAPIView):
    serializer_class = ContactMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ContactMethod.objects.filter(user=self.request.user)


class ChannelPreferenceView(RetrieveUpdateAPIView):
    serializer_class = ChannelPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        preference, created = ChannelPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference
