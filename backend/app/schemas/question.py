from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class QuestionCreate(BaseModel):
    id: Optional[str] = None
    documentId: Optional[str] = None
    sourceDoc: Optional[str] = None
    question: str
    category: Optional[str] = "Doctor Discussion"
    resolved: Optional[bool] = False
    createdAt: Optional[str] = "Today"

class QuestionUpdate(BaseModel):
    question: Optional[str] = None
    category: Optional[str] = None
    resolved: Optional[bool] = None

class QuestionResponse(BaseModel):
    id: str
    documentId: Optional[str] = None
    sourceDoc: Optional[str] = None
    question: str
    category: str
    resolved: bool
    createdAt: str
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class QuestionListResponse(BaseModel):
    questions: List[QuestionResponse]
    total: int
