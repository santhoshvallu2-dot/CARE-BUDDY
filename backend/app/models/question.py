from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class QuestionModel(Base):
    __tablename__ = "questions"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    source_doc = Column(String(255), nullable=True)
    question = Column(Text, nullable=False)
    category = Column(String(100), default="Doctor Discussion")
    resolved = Column(Boolean, default=False, index=True)
    created_at = Column(String(50), default="Today")
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document = relationship("DocumentModel", back_populates="questions")
