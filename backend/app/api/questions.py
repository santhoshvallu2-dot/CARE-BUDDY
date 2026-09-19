import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.question import QuestionModel
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
)

router = APIRouter(prefix="/questions", tags=["Questions"])

def serialize_question(q: QuestionModel) -> QuestionResponse:
    return QuestionResponse(
        id=q.id,
        documentId=q.document_id,
        sourceDoc=q.source_doc,
        question=q.question,
        category=q.category,
        resolved=q.resolved,
        createdAt=q.created_at,
        timestamp=q.timestamp
    )

@router.get("", response_model=List[QuestionResponse])
def get_questions(db: Session = Depends(get_db)):
    """Retrieve all doctor consultation questions."""
    questions = db.query(QuestionModel).order_by(QuestionModel.timestamp.desc()).all()
    return [serialize_question(q) for q in questions]

@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)):
    """Save a doctor consultation question."""
    q_id = payload.id or f"q-{uuid.uuid4().hex[:8]}"

    existing = db.query(QuestionModel).filter(QuestionModel.id == q_id).first()
    if existing:
        existing.question = payload.question
        existing.category = payload.category or existing.category
        existing.source_doc = payload.sourceDoc or existing.source_doc
        existing.resolved = payload.resolved if payload.resolved is not None else existing.resolved
        db.commit()
        db.refresh(existing)
        return serialize_question(existing)

    new_q = QuestionModel(
        id=q_id,
        document_id=payload.documentId,
        source_doc=payload.sourceDoc,
        question=payload.question,
        category=payload.category or "Doctor Discussion",
        resolved=payload.resolved or False,
        created_at=payload.createdAt or "Today"
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return serialize_question(new_q)

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(question_id: str, payload: QuestionUpdate, db: Session = Depends(get_db)):
    """Update question text, category, or resolved status."""
    q = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID '{question_id}' not found."
        )

    if payload.question is not None:
        q.question = payload.question
    if payload.category is not None:
        q.category = payload.category
    if payload.resolved is not None:
        q.resolved = payload.resolved

    db.commit()
    db.refresh(q)
    return serialize_question(q)

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    """Delete a question."""
    q = db.query(QuestionModel).filter(QuestionModel.id == question_id).first()
    if not q:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID '{question_id}' not found."
        )
    db.delete(q)
    db.commit()
    return None
