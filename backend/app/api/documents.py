import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import DocumentModel, CareAnalysisModel
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse
from app.schemas.analysis import CareAnalysisCreate, CareAnalysisResponse

router = APIRouter(prefix="/documents", tags=["Documents"])

def serialize_document(doc: DocumentModel) -> DocumentResponse:
    analysis_resp = None
    if doc.analysis:
        analysis_resp = CareAnalysisResponse(
            id=doc.analysis.id,
            document_id=doc.analysis.document_id,
            summary=doc.analysis.summary,
            simpleExplanation=doc.analysis.simple_explanation,
            identifiedInstructions=doc.analysis.identified_instructions,
            uncertainInformation=doc.analysis.uncertain_information,
            questionsForProfessional=doc.analysis.questions_for_professional,
            safetyNotice=doc.analysis.safety_notice
        )

    return DocumentResponse(
        id=doc.id,
        title=doc.title,
        date=doc.date,
        status=doc.status,
        category=doc.category,
        fileSize=doc.file_size,
        source=doc.source,
        rawText=doc.raw_text,
        extractedText=doc.extracted_text,
        summary=doc.summary,
        instructions=doc.instructions,
        analysis=analysis_resp,
        createdAt=doc.created_at
    )

@router.get("", response_model=List[DocumentResponse])
def get_documents(db: Session = Depends(get_db)):
    """Retrieve all verified healthcare documents."""
    docs = db.query(DocumentModel).order_by(DocumentModel.created_at.desc()).all()
    return [serialize_document(d) for d in docs]

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    """Retrieve a single document by ID."""
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )
    return serialize_document(doc)

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    """Save a verified healthcare document with optional AI analysis."""
    doc_id = payload.id or f"doc-{uuid.uuid4().hex[:8]}"

    # Check for existing document with same ID
    existing = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if existing:
        # Update existing
        existing.title = payload.title
        existing.category = payload.category or existing.category
        existing.raw_text = payload.rawText or existing.raw_text
        existing.extracted_text = payload.extractedText or existing.extracted_text
        existing.summary = payload.summary or existing.summary
        if payload.instructions:
            existing.instructions = [i.model_dump() for i in payload.instructions]
        db.commit()
        db.refresh(existing)
        return serialize_document(existing)

    new_doc = DocumentModel(
        id=doc_id,
        title=payload.title,
        date=payload.date or "Uploaded today",
        status=payload.status or "ready",
        category=payload.category or "Care Plan & Prescription",
        file_size=payload.fileSize,
        source=payload.source or "Verified Healthcare Document",
        raw_text=payload.rawText,
        extracted_text=payload.extractedText,
        summary=payload.summary
    )
    if payload.instructions:
        new_doc.instructions = [i.model_dump() for i in payload.instructions]

    db.add(new_doc)
    db.flush()

    if payload.analysis:
        analysis_id = payload.analysis.id or f"analysis-{uuid.uuid4().hex[:8]}"
        new_analysis = CareAnalysisModel(
            id=analysis_id,
            document_id=new_doc.id,
            summary=payload.analysis.summary,
            simple_explanation=payload.analysis.simpleExplanation,
            safety_notice=payload.analysis.safetyNotice
        )
        new_analysis.identified_instructions = [i.model_dump() for i in payload.analysis.identifiedInstructions]
        new_analysis.uncertain_information = payload.analysis.uncertainInformation
        new_analysis.questions_for_professional = payload.analysis.questionsForProfessional
        db.add(new_analysis)

    db.commit()
    db.refresh(new_doc)
    return serialize_document(new_doc)

@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(document_id: str, payload: DocumentUpdate, db: Session = Depends(get_db)):
    """Update metadata or content of an existing document."""
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )

    if payload.title is not None:
        doc.title = payload.title
    if payload.category is not None:
        doc.category = payload.category
    if payload.status is not None:
        doc.status = payload.status
    if payload.rawText is not None:
        doc.raw_text = payload.rawText
    if payload.extractedText is not None:
        doc.extracted_text = payload.extractedText
    if payload.summary is not None:
        doc.summary = payload.summary
    if payload.instructions is not None:
        doc.instructions = [i.model_dump() for i in payload.instructions]

    db.commit()
    db.refresh(doc)
    return serialize_document(doc)

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a healthcare document and its associated care analyses."""
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )
    db.delete(doc)
    db.commit()
    return None

@router.get("/{document_id}/analysis", response_model=CareAnalysisResponse)
def get_document_analysis(document_id: str, db: Session = Depends(get_db)):
    """Retrieve AI care analysis for a document."""
    analysis = db.query(CareAnalysisModel).filter(CareAnalysisModel.document_id == document_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis for document ID '{document_id}' not found."
        )
    return CareAnalysisResponse(
        id=analysis.id,
        document_id=analysis.document_id,
        summary=analysis.summary,
        simpleExplanation=analysis.simple_explanation,
        identifiedInstructions=analysis.identified_instructions,
        uncertainInformation=analysis.uncertain_information,
        questionsForProfessional=analysis.questions_for_professional,
        safetyNotice=analysis.safety_notice
    )

@router.post("/{document_id}/analysis", response_model=CareAnalysisResponse, status_code=status.HTTP_201_CREATED)
def save_document_analysis(document_id: str, payload: CareAnalysisCreate, db: Session = Depends(get_db)):
    """Save or replace AI care analysis for a document."""
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )

    existing = db.query(CareAnalysisModel).filter(CareAnalysisModel.document_id == document_id).first()
    if existing:
        existing.summary = payload.summary
        existing.simple_explanation = payload.simpleExplanation
        existing.identified_instructions = [i.model_dump() for i in payload.identifiedInstructions]
        existing.uncertain_information = payload.uncertainInformation
        existing.questions_for_professional = payload.questionsForProfessional
        existing.safety_notice = payload.safetyNotice
        db.commit()
        db.refresh(existing)
        target = existing
    else:
        analysis_id = payload.id or f"analysis-{uuid.uuid4().hex[:8]}"
        new_analysis = CareAnalysisModel(
            id=analysis_id,
            document_id=document_id,
            summary=payload.summary,
            simple_explanation=payload.simpleExplanation,
            safety_notice=payload.safetyNotice
        )
        new_analysis.identified_instructions = [i.model_dump() for i in payload.identifiedInstructions]
        new_analysis.uncertain_information = payload.uncertainInformation
        new_analysis.questions_for_professional = payload.questionsForProfessional
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        target = new_analysis

    return CareAnalysisResponse(
        id=target.id,
        document_id=target.document_id,
        summary=target.summary,
        simpleExplanation=target.simple_explanation,
        identifiedInstructions=target.identified_instructions,
        uncertainInformation=target.uncertain_information,
        questionsForProfessional=target.questions_for_professional,
        safetyNotice=target.safety_notice
    )
