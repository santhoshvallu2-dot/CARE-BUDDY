from typing import List, Optional
from pydantic import BaseModel

class IdentifiedInstructionSchema(BaseModel):
    id: str
    instruction: str
    sourceText: str
    confidence: str = "clear"
    timing: Optional[str] = None
    type: Optional[str] = "medication"

class CareAnalysisCreate(BaseModel):
    id: Optional[str] = None
    summary: str
    simpleExplanation: str
    identifiedInstructions: List[IdentifiedInstructionSchema] = []
    uncertainInformation: List[str] = []
    questionsForProfessional: List[str] = []
    safetyNotice: str = "CareBuddy AI organizes and explains information you provide. It does not diagnose conditions, prescribe treatment, or replace professional medical advice."

class CareAnalysisResponse(BaseModel):
    id: str
    document_id: str
    summary: str
    simpleExplanation: str
    identifiedInstructions: List[IdentifiedInstructionSchema] = []
    uncertainInformation: List[str] = []
    questionsForProfessional: List[str] = []
    safetyNotice: str

    class Config:
        from_attributes = True
