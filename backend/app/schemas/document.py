from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.analysis import CareAnalysisCreate, CareAnalysisResponse

class ExtractedInstructionSchema(BaseModel):
    id: str
    action: str
    timing: str
    details: str
    type: str = "medication"

class DocumentCreate(BaseModel):
    id: Optional[str] = None
    title: str
    date: Optional[str] = "Uploaded today"
    status: Optional[str] = "ready"
    category: Optional[str] = "Care Plan & Prescription"
    fileSize: Optional[str] = None
    source: Optional[str] = None
    rawText: Optional[str] = None
    extractedText: Optional[str] = None
    summary: Optional[str] = None
    instructions: Optional[List[ExtractedInstructionSchema]] = []
    analysis: Optional[CareAnalysisCreate] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    rawText: Optional[str] = None
    extractedText: Optional[str] = None
    summary: Optional[str] = None
    instructions: Optional[List[ExtractedInstructionSchema]] = None

class DocumentResponse(BaseModel):
    id: str
    title: str
    date: str
    status: str
    category: str
    fileSize: Optional[str] = None
    source: Optional[str] = None
    rawText: Optional[str] = None
    extractedText: Optional[str] = None
    summary: Optional[str] = None
    instructions: List[ExtractedInstructionSchema] = []
    analysis: Optional[CareAnalysisResponse] = None
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
