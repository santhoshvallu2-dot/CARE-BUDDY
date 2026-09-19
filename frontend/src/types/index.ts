export type NavTab = 'home' | 'documents' | 'reminders' | 'questions' | 'profile';

export type DocumentStatus = 'uploading' | 'processing' | 'review' | 'ready' | 'error' | 'uploaded';

export type ReminderStatus = 'upcoming' | 'completed' | 'missed';

export interface ExtractedInstruction {
  id: string;
  action: string;
  timing: string;
  details: string;
  type: 'medication' | 'activity' | 'diet' | 'appointment' | 'measurement' | 'routine';
}

export interface IdentifiedInstruction {
  id: string;
  instruction: string;
  sourceText: string;
  confidence: 'clear' | 'needs_verification';
  timing?: string;
  type?: 'medication' | 'activity' | 'diet' | 'appointment' | 'measurement' | 'routine';
}

export interface CareAnalysisResult {
  summary: string;
  simpleExplanation: string;
  identifiedInstructions: IdentifiedInstruction[];
  uncertainInformation: string[];
  questionsForProfessional: string[];
  safetyNotice: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  date: string;
  status: DocumentStatus;
  category: string;
  fileSize?: string;
  imageUrl?: string;
  rawText?: string;
  extractedText?: string;
  summary?: string;
  instructions?: ExtractedInstruction[];
  analysis?: CareAnalysisResult;
  source?: string;
}

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
  error?: string;
}

export interface ReminderItem {
  id: string;
  title: string; // Medicine or Routine name
  instruction: string; // Specific instructions
  time: string; // e.g. "08:00 AM"
  frequency: string; // e.g. "Once daily", "Twice daily", "Every 8 hours", "As needed"
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  notes?: string;
  tag?: string;
  category?: 'medication' | 'routine' | 'measurement';
  sourceDocumentId?: string;
  sourceDocumentTitle?: string;
  createdAt: string;
  completedDates: string[]; // List of YYYY-MM-DD date strings
  completed?: boolean; // Derived status for today
  status?: ReminderStatus; // Derived status (upcoming, completed, missed)
  isDemo?: boolean;
}

export interface QuestionItem {
  id: string;
  question: string;
  sourceDoc?: string;
  category: string;
  resolved: boolean;
  createdAt: string;
}

export interface UserPreferences {
  pushNotifications: boolean;
  soundAlerts: boolean;
  vibrateAlerts: boolean;
  highContrast: boolean;
  demoMode: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  primaryCaregiver: string;
  caregiverPhone: string;
  primaryDoctor: string;
  doctorPhone: string;
  clinicName: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}
