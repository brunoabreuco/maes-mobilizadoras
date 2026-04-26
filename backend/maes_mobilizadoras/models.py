import uuid
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Numeric, JSON

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone = Column(String(20), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    neighborhood = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AuthOTP(db.Model):
    __tablename__ = 'auth_otp'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone = Column(String(20), nullable=False)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class EventCategory(db.Model):
    __tablename__ = 'event_categories'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(80), nullable=False)
    icon = Column(String(50), nullable=True)
    color = Column(String(7), nullable=True)

class Event(db.Model):
    __tablename__ = 'events'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_datetime = Column(DateTime, nullable=False)
    location_name = Column(String(200), nullable=False)
    location_lat = Column(Numeric(9, 6), nullable=True)
    location_lng = Column(Numeric(9, 6), nullable=True)
    category_id = Column(Integer, ForeignKey('event_categories.id'), nullable=False)
    organizer_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    max_participants = Column(Integer, nullable=True)
    participant_count = Column(Integer, default=0)
    status = Column(String(20), nullable=False)
    cover_image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class EventParticipation(db.Model):
    __tablename__ = 'event_participations'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey('events.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    status = Column(String(20), nullable=False)
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SyncQueue(db.Model):
    __tablename__ = 'sync_queue'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False)
    operation = Column(String(10), nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String(20), nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    processed_at = Column(DateTime, nullable=True)

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey('events.id'), nullable=False)
    sender_id = Column(String(36), ForeignKey('sync_queue.id'), nullable=False)
    type = Column(String(30), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(String(300), nullable=False)
    target_role = Column(String(20), nullable=False)
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class NotificationRead(db.Model):
    __tablename__ = 'notification_reads'
    id = Column(String(36), primary_key=True, default=generate_uuid)
    notification_id = Column(String(36), ForeignKey('notifications.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    read_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class FCMToken(db.Model):
    __tablename__ = 'fcm_tokens'
    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)
    token = Column(Text, primary_key=True)
    device_type = Column(String(10), nullable=True)
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
