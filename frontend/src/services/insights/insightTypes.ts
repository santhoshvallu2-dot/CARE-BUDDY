import { IdentifiedInstruction } from '../ai/types';

export type InsightType = 'verification' | 'action' | 'routine' | 'question' | 'document';
export type InsightPriority = 'high' | 'medium' | 'low';
export type InsightPriorityLabel = 'Needs Verification' | 'Action Suggested' | 'Routine Update';

export interface CareInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  priorityLabel: InsightPriorityLabel;
  title: string;
  message: string;
  whyText: string;
  sourceDocId?: string;
  sourceDocTitle?: string;
  sourceText?: string;
  actionLabel?: string;
  actionType?: 'view_document' | 'create_reminder' | 'view_questions' | 'view_routine';
  instructionPayload?: IdentifiedInstruction;
}

export interface WeeklyRoutineStat {
  dayLabel: string; // e.g. "Mon", "Tue"
  dateStr: string;  // "YYYY-MM-DD"
  completedCount: number;
  totalCount: number;
  percentage: number;
}
