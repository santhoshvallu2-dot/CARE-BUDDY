from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.document import DocumentModel, CareAnalysisModel
from app.models.reminder import ReminderModel, ReminderCompletionModel
from app.models.question import QuestionModel

def evaluate_backend_insights(db: Session) -> List[Dict[str, Any]]:
    """
    Generate deterministic organizational care insights from verified stored records.
    Never produces medical judgments or severity rankings.
    """
    insights = []

    # 1. High Priority: Documents with uncertain information requiring doctor verification
    analyses = db.query(CareAnalysisModel).all()
    for analysis in analyses:
        uncertain_list = analysis.uncertain_information
        if uncertain_list and len(uncertain_list) > 0:
            doc = analysis.document
            doc_title = doc.title if doc else "Uploaded Document"
            insights.append({
                "id": f"insight-verif-{analysis.id}",
                "type": "verification",
                "priority": "high",
                "priorityLabel": "Needs Verification",
                "title": "Information Needs Confirmation",
                "message": f"{len(uncertain_list)} note(s) in '{doc_title}' requires verification with your healthcare professional.",
                "whyText": "This document contains medical notes, Latin abbreviations, or instructions that could not be verified with complete certainty.",
                "sourceDocId": analysis.document_id,
                "sourceDocTitle": doc_title,
                "sourceText": uncertain_list[0],
                "actionLabel": "Review Document",
                "actionType": "view_document",
            })

    # 2. Medium Priority: Active questions to discuss with healthcare provider
    active_questions = db.query(QuestionModel).filter(QuestionModel.resolved == False).all()
    if len(active_questions) > 0:
        first_q = active_questions[0]
        insights.append({
            "id": "insight-questions-active",
            "type": "question",
            "priority": "medium",
            "priorityLabel": "Action Suggested",
            "title": "Doctor Questions Ready",
            "message": f"You have {len(active_questions)} saved question(s) to discuss at your next healthcare appointment.",
            "whyText": "Clarifying questions were organized from your medical documents to help you prepare for clinic visits.",
            "sourceDocTitle": first_q.source_doc or "Doctor Consultation List",
            "sourceText": first_q.question,
            "actionLabel": "View Questions",
            "actionType": "view_questions",
        })

    # 3. Low Priority: Daily routine progress
    reminders = db.query(ReminderModel).all()
    if len(reminders) > 0:
        insights.append({
            "id": "insight-routine-summary",
            "type": "routine",
            "priority": "low",
            "priorityLabel": "Routine Update",
            "title": "Routine Schedule Active",
            "message": f"You have {len(reminders)} care routine(s) scheduled in your active plan.",
            "whyText": "Calculated directly from your confirmed reminder checklist.",
            "actionLabel": "Open Reminders",
            "actionType": "view_routine",
        })

    # Sort: high first, medium second, low third
    priority_order = {"high": 1, "medium": 2, "low": 3}
    return sorted(insights, key=lambda x: priority_order.get(x.get("priority", "low"), 3))
