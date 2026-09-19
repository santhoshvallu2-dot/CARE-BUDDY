/**
 * Caregiver Cross-Device Handoff Types
 * Custom local bridge for transferring verified care routines from Patient Phone to Caregiver PC.
 */

export interface HandoffSelectionOptions {
  shareSummary: boolean;
  shareTodayRoutines: boolean;
  shareReminders: boolean;
  shareQuestions: boolean;
}

export interface CaregiverHandoffData {
  version: '1.0';
  sessionId: string;
  transferCode: string; // 6-digit sync code
  createdAt: string;
  expiresAt: string;
  patientName: string;
  sourceApp: 'CareBuddy AI';
  isVerifiedByUser: boolean;
  sectionsIncluded: {
    careSummary: boolean;
    todayRoutines: boolean;
    remindersSchedule: boolean;
    doctorQuestions: boolean;
  };
  summary?: {
    title: string;
    simpleExplanation: string;
    instructionsCount: number;
    safetyNotice: string;
  };
  todayRoutines?: {
    date: string;
    completedDoses: number;
    totalDoses: number;
    adherencePercentage: number;
    items: {
      title: string;
      time: string;
      instruction: string;
      completed: boolean;
    }[];
  };
  remindersSchedule?: {
    id: string;
    title: string;
    time: string;
    frequency: string;
    instruction: string;
  }[];
  doctorQuestions?: {
    id: string;
    question: string;
    category: string;
    resolved: boolean;
  }[];
}
