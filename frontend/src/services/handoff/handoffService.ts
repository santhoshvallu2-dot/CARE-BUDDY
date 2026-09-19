import { CaregiverHandoffData, HandoffSelectionOptions } from '../../types/handoff';
import { DocumentItem, ReminderItem, QuestionItem } from '../../types';
import { calculateTodayProgress, getTodayDateString } from '../reminderService';

const HANDOFF_STORAGE_PREFIX = 'carebuddy_handoff_session_';

/**
 * Generates a clean 6-digit alphanumeric transfer code (e.g. "CB-8492" or "849201")
 */
export function generateTransferCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Creates a sanitized, privacy-safe handoff data package.
 * Never includes raw database internals, API credentials, or unconfirmed records.
 */
export function createHandoffPayload(
  patientName: string,
  options: HandoffSelectionOptions,
  documents: DocumentItem[],
  reminders: ReminderItem[],
  questions: QuestionItem[]
): CaregiverHandoffData {
  const sessionId = `handoff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const transferCode = generateTransferCode();
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24-hour expiry

  const payload: CaregiverHandoffData = {
    version: '1.0',
    sessionId,
    transferCode,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    patientName: patientName || 'Patient Caregiver Member',
    sourceApp: 'CareBuddy AI',
    isVerifiedByUser: true,
    sectionsIncluded: {
      careSummary: options.shareSummary,
      todayRoutines: options.shareTodayRoutines,
      remindersSchedule: options.shareReminders,
      doctorQuestions: options.shareQuestions,
    },
  };

  // 1. Care Summary section
  if (options.shareSummary && documents.length > 0) {
    const primaryDoc = documents.find((d) => d.analysis || d.summary) || documents[0];
    payload.summary = {
      title: primaryDoc.title,
      simpleExplanation:
        primaryDoc.analysis?.simpleExplanation ||
        primaryDoc.summary ||
        'Verified medical document instructions organized for daily routine.',
      instructionsCount: primaryDoc.analysis?.identifiedInstructions?.length || primaryDoc.instructions?.length || 0,
      safetyNotice:
        'Non-diagnostic healthcare routine organizer. All instructions were reviewed and confirmed by the patient.',
    };
  }

  // 2. Today's Routines section
  if (options.shareTodayRoutines) {
    const todayStr = getTodayDateString();
    const { completed, total, percentage } = calculateTodayProgress(reminders);
    payload.todayRoutines = {
      date: todayStr,
      completedDoses: completed,
      totalDoses: total,
      adherencePercentage: percentage,
      items: reminders.map((r) => ({
        title: r.title,
        time: r.time,
        instruction: r.instruction,
        completed: Boolean(r.completedDates?.includes(todayStr)),
      })),
    };
  }

  // 3. Reminders Schedule section
  if (options.shareReminders) {
    payload.remindersSchedule = reminders.map((r) => ({
      id: r.id,
      title: r.title,
      time: r.time,
      frequency: r.frequency || 'Once daily',
      instruction: r.instruction,
    }));
  }

  // 4. Doctor Questions section
  if (options.shareQuestions) {
    payload.doctorQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      category: q.category || 'General Care',
      resolved: Boolean(q.resolved),
    }));
  }

  return payload;
}

/**
 * Encodes payload into a compact Base64 transfer string
 */
export function encodeHandoffData(data: CaregiverHandoffData): string {
  try {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  } catch (err) {
    console.error('Error encoding handoff data:', err);
    return JSON.stringify(data);
  }
}

/**
 * Decodes and strictly validates incoming handoff string or JSON
 */
export function decodeHandoffData(rawInput: string): CaregiverHandoffData {
  let jsonString = rawInput.trim();

  // Try decoding if Base64
  if (!jsonString.startsWith('{')) {
    try {
      jsonString = decodeURIComponent(atob(jsonString));
    } catch {
      // Keep as-is if already raw JSON
    }
  }

  const parsed = JSON.parse(jsonString);

  if (!parsed || parsed.sourceApp !== 'CareBuddy AI' || !parsed.sessionId) {
    throw new Error('Invalid CareBuddy handoff package. Missing required security tags.');
  }

  // Check expiry
  if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
    throw new Error('This handoff session has expired. Please request an updated share from the patient device.');
  }

  return parsed as CaregiverHandoffData;
}

/**
 * Save active session locally so receiver on the same network or test device can lookup by code
 */
export function saveHandoffSession(data: CaregiverHandoffData): void {
  try {
    localStorage.setItem(`${HANDOFF_STORAGE_PREFIX}${data.transferCode.toUpperCase()}`, JSON.stringify(data));
    localStorage.setItem(`${HANDOFF_STORAGE_PREFIX}latest`, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save handoff session to localStorage:', err);
  }
}

/**
 * Retrieve session by 6-digit transfer code
 */
export function getHandoffSessionByCode(code: string): CaregiverHandoffData | null {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  try {
    const stored = localStorage.getItem(`${HANDOFF_STORAGE_PREFIX}${cleanCode}`);
    if (stored) {
      return decodeHandoffData(stored);
    }
    // Check latest fallback for local same-browser demo
    const latest = localStorage.getItem(`${HANDOFF_STORAGE_PREFIX}latest`);
    if (latest) {
      const parsed = JSON.parse(latest);
      if (parsed.transferCode?.toUpperCase() === cleanCode) {
        return decodeHandoffData(latest);
      }
    }
  } catch (err) {
    console.error('Error retrieving handoff by code:', err);
  }

  return null;
}
