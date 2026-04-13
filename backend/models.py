"""
ALTRIX Database Models
SQLite schema for Insider Threat Detection Platform
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True)  # U001-U050 or secadmin
    name = Column(String, nullable=False)
    department = Column(String)
    email = Column(String)
    role = Column(String, default='user')  # 'user' or 'admin'
    password = Column(String, default='user123')
    risk_score = Column(Float, default=0.0)
    is_malicious = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    activities = relationship("ActivityLog", back_populates="user")
    incidents = relationship("Incident", back_populates="user")
    access_requests = relationship("AccessRequest", back_populates="user")


class ActivityLog(Base):
    __tablename__ = 'activity_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'))
    activity_type = Column(String)
    description = Column(Text)
    risk_contribution = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    meta_data = Column(Text)
    
    user = relationship("User", back_populates="activities")


class Incident(Base):
    __tablename__ = 'incidents'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'))
    title = Column(String, nullable=False)
    description = Column(Text)
    severity = Column(String)
    status = Column(String, default='open')
    is_guilty = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="incidents")


class SensitiveFile(Base):
    __tablename__ = 'sensitive_files'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String, nullable=False)
    category = Column(String)
    sensitivity_level = Column(String)
    department = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    access_requests = relationship("AccessRequest", back_populates="file")


class AccessRequest(Base):
    __tablename__ = 'access_requests'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'))
    file_id = Column(Integer, ForeignKey('sensitive_files.id'))
    reason = Column(Text)
    status = Column(String, default='pending')
    requested_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String, nullable=True)
    
    user = relationship("User", back_populates="access_requests")
    file = relationship("SensitiveFile", back_populates="access_requests")


class RiskScoreHistory(Base):
    __tablename__ = 'risk_score_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'))
    risk_score = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    reason = Column(String)


def init_db(db_path='altrix.db'):
    """Initialize the database and create all tables"""
    engine = create_engine(f'sqlite:///{db_path}')
    Base.metadata.create_all(engine)
    return engine


def get_session(db_path='altrix.db'):
    """Get a database session"""
    engine = create_engine(f'sqlite:///{db_path}')
    Session = sessionmaker(bind=engine)
    return Session()
