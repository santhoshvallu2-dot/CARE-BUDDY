from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ReminderModel(Base):
    __tablename__ = "reminders"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    instruction = Column(Text, nullable=False)
    time = Column(String(50), nullable=False)
    frequency = Column(String(100), default="Once daily")
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    tag = Column(String(100), nullable=True)
    category = Column(String(50), default="medication")
    source_document_id = Column(String(64), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    source_document_title = Column(String(255), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    source_document = relationship("DocumentModel", back_populates="reminders")
    completions = relationship("ReminderCompletionModel", back_populates="reminder", cascade="all, delete-orphan")


class ReminderCompletionModel(Base):
    __tablename__ = "reminder_completions"

    id = Column(String(64), primary_key=True, index=True)
    reminder_id = Column(String(64), ForeignKey("reminders.id", ondelete="CASCADE"), nullable=False, index=True)
    completion_date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    completed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    reminder = relationship("ReminderModel", back_populates="completions")
