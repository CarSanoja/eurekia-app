from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import uuid


class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        if not name:
            raise ValueError('Users must have a name')
        
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=255)
    avatar_icon = models.CharField(max_length=50, blank=True)
    avatar_color = models.CharField(max_length=7, default='#0ea5e9')
    locale = models.CharField(max_length=5, default='en')
    class_code = models.ForeignKey('core.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.name} ({self.email})"


class ContactMethod(models.Model):
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    CONSENT_CHOICES = [
        ('pending', 'Pending'),
        ('granted', 'Granted'),
        ('revoked', 'Revoked'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contact_methods')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    address = models.CharField(max_length=255)
    verified = models.BooleanField(default=False)
    consent = models.CharField(max_length=20, choices=CONSENT_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contact_methods'
        unique_together = ['user', 'channel', 'address']
        indexes = [
            models.Index(fields=['user', 'channel']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.channel}: {self.address}"


class ChannelPreference(models.Model):
    CHANNEL_CHOICES = [
        ('web', 'Web'),
        ('email', 'Email'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='channel_preference')
    primary = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='web')
    allow_prompts = models.BooleanField(default=True)
    quiet_hours = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'channel_preferences'
    
    def __str__(self):
        return f"{self.user.name} - Primary: {self.primary}"


class Role(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('coach', 'Coach'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = 'roles'
    
    def __str__(self):
        return self.name


class UserRole(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='roles_granted')
    
    class Meta:
        db_table = 'user_roles'
        unique_together = ['user', 'role']
    
    def __str__(self):
        return f"{self.user.name} - {self.role.name}"
