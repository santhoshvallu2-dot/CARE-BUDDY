import { CareInsight, WeeklyRoutineStat } from './insightTypes';
import { DocumentItem, ReminderItem, QuestionItem } from '../../types';
import { getTodayDateString, isCompletedForDate } from '../reminderService';

/**
 * Checks if a given instruction is already organized as an active reminder.
 * Compares key medicine/action tokens against reminder titles without making medical inferences.
 */
export function isInstructionScheduled(
  instructionText: string,
  reminders: ReminderItem[]
): boolean {
  if (!instructionText || reminders.length === 0) return false;
  const instClean = instructionText.toLowerCase();

  // Extract significant words (length > 3)
  const words = instClean
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  return reminders.some((r) => {
    const remTitle = r.title.toLowerCase();
    const remInstruction = r.instruction.toLowerCase();

    // Check if reminder contains key medicine or action words from instruction
    return words.some((word) => remTitle.includes(word) || remInstruction.includes(word));
  });
}

/**
 * Generate deterministic organizational insights from existing verified data.
 * Purely organizational — never generates diagnoses or medical risk assessments.
 */
export function evaluateCareInsights(
  documents: DocumentItem[],
  reminders: ReminderItem[],
  questions: QuestionItem[]
): CareInsight[] {
  const insights: CareInsight[] = [];
  const todayStr = getTodayDateString();

  // 1. HIGH PRIORITY: Unclear Information requiring user verification
  documents.forEach((doc) => {
    const uncertainList = doc.analysis?.uncertainInformation || [];
    if (uncertainList.length > 0) {
      insights.push({
        id: `insight-verif-${doc.id}`,
        type: 'verification',
        priority: 'high',
        priorityLabel: 'Needs Verification',
        title: 'Information Needs Confirmation',
        message: `${uncertainList.length} note${uncertainList.length > 1 ? 's' : ''} in "${doc.title}" requires verification with your healthcare professional.`,
        whyText: 'This document contains medical notes, Latin abbreviations, or instructions that could not be verified with complete certainty.',
        sourceDocId: doc.id,
        sourceDocTitle: doc.title,
        sourceText: uncertainList[0],
        actionLabel: 'Review Document',
        actionType: 'view_document',
      });
    }
  });

  // 2. MEDIUM PRIORITY: Clearly identified instructions not yet added to routines
  documents.forEach((doc) => {
    const identified = doc.analysis?.identifiedInstructions || [];
    identified.forEach((inst) => {
      const alreadyScheduled = isInstructionScheduled(inst.instruction, reminders);
      if (!alreadyScheduled) {
        insights.push({
          id: `insight-sched-${doc.id}-${inst.id}`,
          type: 'action',
          priority: 'medium',
          priorityLabel: 'Action Suggested',
          title: 'Unscheduled Care Instruction',
          message: `"${inst.instruction}" from "${doc.title}" has not been added to your daily routine schedule.`,
          whyText: 'This instruction was clearly identified in your verified document, but you have not yet confirmed a reminder for it.',
          sourceDocId: doc.id,
          sourceDocTitle: doc.title,
          sourceText: inst.sourceText,
          actionLabel: 'Review & Schedule',
          actionType: 'create_reminder',
          instructionPayload: inst,
        });
      }
    });
  });

  // 3. MEDIUM PRIORITY: Doctor Consultation Questions to Discuss
  const activeQuestions = questions.filter((q) => !q.resolved);
  if (activeQuestions.length > 0) {
    insights.push({
      id: 'insight-questions-active',
      type: 'question',
      priority: 'medium',
      priorityLabel: 'Action Suggested',
      title: 'Doctor Questions Ready',
      message: `You have ${activeQuestions.length} saved question${activeQuestions.length > 1 ? 's' : ''} to discuss at your next healthcare appointment.`,
      whyText: 'Clarifying questions were organized from your medical documents to help you prepare for clinic visits.',
      sourceDocTitle: activeQuestions[0].sourceDoc || 'Doctor Consultation List',
      sourceText: activeQuestions[0].question,
      actionLabel: 'View Questions',
      actionType: 'view_questions',
    });
  }

  // 4. LOW PRIORITY: Daily Routine Progress
  const totalReminders = reminders.length;
  if (totalReminders > 0) {
    const completedToday = reminders.filter((r) => isCompletedForDate(r, todayStr)).length;
    const remainingToday = Math.max(0, totalReminders - completedToday);

    if (remainingToday === 0) {
      insights.push({
        id: 'insight-routine-complete',
        type: 'routine',
        priority: 'low',
        priorityLabel: 'Routine Update',
        title: 'All Routines Completed',
        message: `You have completed all ${totalReminders} scheduled care routines for today.`,
        whyText: 'Calculated directly from your daily reminder checklist for today.',
        actionLabel: 'View Checklist',
        actionType: 'view_routine',
      });
    } else {
      insights.push({
        id: 'insight-routine-progress',
        type: 'routine',
        priority: 'low',
        priorityLabel: 'Routine Update',
        title: 'Today’s Care Progress',
        message: `You have completed ${completedToday} of ${totalReminders} scheduled routines (${remainingToday} remaining).`,
        whyText: 'Calculated directly from your daily reminder checklist for today.',
        actionLabel: 'Open Reminders',
        actionType: 'view_routine',
      });
    }
  }

  // Sort insights: high priority first, then medium, then low
  const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };
  return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Compute weekly routine completion statistics for past 7 days based on real stored completion dates.
 */
export function calculateWeeklyRoutineStats(reminders: ReminderItem[]): WeeklyRoutineStat[] {
  const stats: WeeklyRoutineStat[] = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  // Generate 7 days ending today
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayLabel = days[d.getDay()];

    const totalCount = reminders.length;
    const completedCount = reminders.filter((r) => isCompletedForDate(r, dateStr)).length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    stats.push({
      dayLabel,
      dateStr,
      completedCount,
      totalCount,
      percentage,
    });
  }

  return stats;
}
