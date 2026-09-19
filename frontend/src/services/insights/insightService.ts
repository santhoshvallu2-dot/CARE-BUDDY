import { CareInsight, WeeklyRoutineStat } from './insightTypes';
import { DocumentItem, ReminderItem, QuestionItem } from '../../types';
import { evaluateCareInsights, calculateWeeklyRoutineStats } from './insightRules';

export class InsightService {
  /**
   * Evaluates all verified application state and returns prioritized care insights.
   */
  static getInsights(
    documents: DocumentItem[],
    reminders: ReminderItem[],
    questions: QuestionItem[]
  ): CareInsight[] {
    return evaluateCareInsights(documents, reminders, questions);
  }

  /**
   * Computes weekly routine completion rates for analytics.
   */
  static getWeeklyAnalytics(reminders: ReminderItem[]): WeeklyRoutineStat[] {
    return calculateWeeklyRoutineStats(reminders);
  }
}

export * from './insightTypes';
export * from './insightRules';
