import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.reminder import ReminderModel, ReminderCompletionModel
from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    ReminderCompletionToggle,
)

router = APIRouter(prefix="/reminders", tags=["Reminders"])

def serialize_reminder(rem: ReminderModel) -> ReminderResponse:
    completed_dates = [c.completion_date for c in rem.completions]
    return ReminderResponse(
        id=rem.id,
        title=rem.title,
        instruction=rem.instruction,
        time=rem.time,
        frequency=rem.frequency,
        startDate=rem.start_date,
        endDate=rem.end_date,
        notes=rem.notes,
        tag=rem.tag,
        category=rem.category,
        sourceDocumentId=rem.source_document_id,
        sourceDocumentTitle=rem.source_document_title,
        completedDates=completed_dates,
        isDemo=rem.is_demo,
        createdAt=rem.created_at
    )

@router.get("", response_model=List[ReminderResponse])
def get_reminders(db: Session = Depends(get_db)):
    """Retrieve all care routine reminders."""
    reminders = db.query(ReminderModel).order_by(ReminderModel.time.asc()).all()
    return [serialize_reminder(r) for r in reminders]

@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(reminder_id: str, db: Session = Depends(get_db)):
    """Retrieve a single reminder by ID."""
    rem = db.query(ReminderModel).filter(ReminderModel.id == reminder_id).first()
    if not rem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with ID '{reminder_id}' not found."
        )
    return serialize_reminder(rem)

@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(payload: ReminderCreate, db: Session = Depends(get_db)):
    """Save an explicitly confirmed routine reminder."""
    rem_id = payload.id or f"rem-{uuid.uuid4().hex[:8]}"

    existing = db.query(ReminderModel).filter(ReminderModel.id == rem_id).first()
    if existing:
        existing.title = payload.title
        existing.instruction = payload.instruction
        existing.time = payload.time
        existing.frequency = payload.frequency or existing.frequency
        existing.start_date = payload.startDate
        existing.end_date = payload.endDate
        existing.notes = payload.notes
        existing.tag = payload.tag
        existing.category = payload.category or existing.category
        existing.source_document_id = payload.sourceDocumentId
        existing.source_document_title = payload.sourceDocumentTitle
        db.commit()
        db.refresh(existing)
        return serialize_reminder(existing)

    new_rem = ReminderModel(
        id=rem_id,
        title=payload.title,
        instruction=payload.instruction,
        time=payload.time,
        frequency=payload.frequency or "Once daily",
        start_date=payload.startDate,
        end_date=payload.endDate,
        notes=payload.notes,
        tag=payload.tag,
        category=payload.category or "medication",
        source_document_id=payload.sourceDocumentId,
        source_document_title=payload.sourceDocumentTitle,
        is_demo=payload.isDemo or False
    )
    db.add(new_rem)
    db.flush()

    if payload.completedDates:
        for c_date in payload.completedDates:
            comp = ReminderCompletionModel(
                id=f"comp-{uuid.uuid4().hex[:8]}",
                reminder_id=new_rem.id,
                completion_date=c_date
            )
            db.add(comp)

    db.commit()
    db.refresh(new_rem)
    return serialize_reminder(new_rem)

@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(reminder_id: str, payload: ReminderUpdate, db: Session = Depends(get_db)):
    """Update details of an existing reminder."""
    rem = db.query(ReminderModel).filter(ReminderModel.id == reminder_id).first()
    if not rem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with ID '{reminder_id}' not found."
        )

    if payload.title is not None:
        rem.title = payload.title
    if payload.instruction is not None:
        rem.instruction = payload.instruction
    if payload.time is not None:
        rem.time = payload.time
    if payload.frequency is not None:
        rem.frequency = payload.frequency
    if payload.startDate is not None:
        rem.start_date = payload.startDate
    if payload.endDate is not None:
        rem.end_date = payload.endDate
    if payload.notes is not None:
        rem.notes = payload.notes
    if payload.tag is not None:
        rem.tag = payload.tag
    if payload.category is not None:
        rem.category = payload.category

    db.commit()
    db.refresh(rem)
    return serialize_reminder(rem)

@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(reminder_id: str, db: Session = Depends(get_db)):
    """Delete a reminder and its completion history."""
    rem = db.query(ReminderModel).filter(ReminderModel.id == reminder_id).first()
    if not rem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with ID '{reminder_id}' not found."
        )
    db.delete(rem)
    db.commit()
    return None

@router.post("/{reminder_id}/complete", response_model=ReminderResponse)
def toggle_reminder_completion(
    reminder_id: str,
    payload: ReminderCompletionToggle,
    db: Session = Depends(get_db)
):
    """Mark a routine complete for a given date string (YYYY-MM-DD), or unmark if already completed."""
    rem = db.query(ReminderModel).filter(ReminderModel.id == reminder_id).first()
    if not rem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reminder with ID '{reminder_id}' not found."
        )

    existing = db.query(ReminderCompletionModel).filter(
        ReminderCompletionModel.reminder_id == reminder_id,
        ReminderCompletionModel.completion_date == payload.date
    ).first()

    if existing:
        db.delete(existing)
    else:
        new_comp = ReminderCompletionModel(
            id=f"comp-{uuid.uuid4().hex[:8]}",
            reminder_id=reminder_id,
            completion_date=payload.date
        )
        db.add(new_comp)

    db.commit()
    db.refresh(rem)
    return serialize_reminder(rem)
