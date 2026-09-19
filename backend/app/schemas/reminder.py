from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class ReminderCreate(BaseModel):
    id: Optional[str] = None
    title: str
    instruction: str
    time: str
    frequency: Optional[str] = "Once daily"
    startDate: str
    endDate: Optional[str] = None
    notes: Optional[str] = None
    tag: Optional[str] = None
    category: Optional[str] = "medication"
    sourceDocumentId: Optional[str] = None
    sourceDocumentTitle: Optional[str] = None
    completedDates: Optional[List[str]] = []
    isDemo: Optional[bool] = False

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    instruction: Optional[str] = None
    time: Optional[str] = None
    frequency: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    notes: Optional[str] = None
    tag: Optional[str] = None
    category: Optional[str] = None

class ReminderCompletionToggle(BaseModel):
    date: str  # YYYY-MM-DD

class ReminderResponse(BaseModel):
    id: str
    title: str
    instruction: str
    time: str
    frequency: str
    startDate: str
    endDate: Optional[str] = None
    notes: Optional[str] = None
    tag: Optional[str] = None
    category: Optional[str] = "medication"
    sourceDocumentId: Optional[str] = None
    sourceDocumentTitle: Optional[str] = None
    completedDates: List[str] = []
    isDemo: bool = False
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class ReminderListResponse(BaseModel):
    reminders: List[ReminderResponse]
    total: int
