import json
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    date = Column(String(100), default="Uploaded today")
    status = Column(String(50), default="ready")
    category = Column(String(100), default="Care Plan & Prescription")
    file_size = Column(String(50), nullable=True)
    source = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=True)
    extracted_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    instructions_json = Column(Text, nullable=True)  # JSON array of ExtractedInstruction
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analysis = relationship("CareAnalysisModel", back_populates="document", uselist=False, cascade="all, delete-orphan")
    reminders = relationship("ReminderModel", back_populates="source_document")
    questions = relationship("QuestionModel", back_populates="document")

    @property
    def instructions(self):
        if self.instructions_json:
            try:
                return json.loads(self.instructions_json)
            except Exception:
                return []
        return []

    @instructions.setter
    def instructions(self, value):
        if value is not None:
            self.instructions_json = json.dumps(value)
        else:
            self.instructions_json = None


class CareAnalysisModel(Base):
    __tablename__ = "care_analyses"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    simple_explanation = Column(Text, nullable=False)
    identified_instructions_json = Column(Text, nullable=True)
    uncertain_information_json = Column(Text, nullable=True)
    questions_for_professional_json = Column(Text, nullable=True)
    safety_notice = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    document = relationship("DocumentModel", back_populates="analysis")

    @property
    def identified_instructions(self):
        if self.identified_instructions_json:
            try:
                return json.loads(self.identified_instructions_json)
            except Exception:
                return []
        return []

    @identified_instructions.setter
    def identified_instructions(self, value):
        self.identified_instructions_json = json.dumps(value) if value is not None else None

    @property
    def uncertain_information(self):
        if self.uncertain_information_json:
            try:
                return json.loads(self.uncertain_information_json)
            except Exception:
                return []
        return []

    @uncertain_information.setter
    def uncertain_information(self, value):
        self.uncertain_information_json = json.dumps(value) if value is not None else None

    @property
    def questions_for_professional(self):
        if self.questions_for_professional_json:
            try:
                return json.loads(self.questions_for_professional_json)
            except Exception:
                return []
        return []

    @questions_for_professional.setter
    def questions_for_professional(self, value):
        self.questions_for_professional_json = json.dumps(value) if value is not None else None
