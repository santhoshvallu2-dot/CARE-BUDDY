import { ReminderItem, ReminderStatus } from '../types';
import { INITIAL_REMINDERS } from '../data/mockData';
import { reminderApi } from './api/reminderApi';

const STORAGE_KEY = 'carebuddy_saved_reminders';

/**
 * Returns today's ISO date string in YYYY-MM-DD local format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a reminder was completed on a given date (default today)
 */
export function isCompletedForDate(reminder: ReminderItem, dateStr = getTodayDateString()): boolean {
  if (!Array.isArray(reminder.completedDates)) return false;
  return reminder.completedDates.includes(dateStr);
}

/**
 * Parses time string like "08:00 AM" or "01:30 PM" into minutes from midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Computes live status: 'completed' | 'upcoming' | 'missed'
 */
export function computeReminderStatus(reminder: ReminderItem, todayStr = getTodayDateString()): ReminderStatus {
  if (isCompletedForDate(reminder, todayStr)) {
    return 'completed';
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const reminderMinutes = parseTimeToMinutes(reminder.time);

  // If the reminder time has passed today and wasn't completed, flag as missed
  if (reminderMinutes > 0 && currentMinutes > reminderMinutes + 30) {
    return 'missed';
  }

  return 'upcoming';
}

/**
 * Normalizes a reminder item with derived completion and status properties
 */
export function enrichReminder(reminder: ReminderItem, todayStr = getTodayDateString()): ReminderItem {
  const completed = isCompletedForDate(reminder, todayStr);
  const status = computeReminderStatus(reminder, todayStr);
  return {
    ...reminder,
    completed,
    status,
  };
}

/**
 * Retrieves all stored reminders from localStorage.
 * Initializes with demo reminders if no custom reminders are found.
 */
export function loadReminders(): ReminderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with rich initial demo reminders
      const todayStr = getTodayDateString();
      const seeded: ReminderItem[] = INITIAL_REMINDERS.map((r, idx) => ({
        ...r,
        startDate: r.startDate || todayStr,
        createdAt: todayStr,
        completedDates: idx === 0 || idx === 1 ? [todayStr] : [],
        isDemo: true,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded.map((r) => enrichReminder(r, todayStr));
    }

    const parsed: ReminderItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const todayStr = getTodayDateString();
    return parsed.map((r) => enrichReminder(r, todayStr));
  } catch (error) {
    console.error('Failed to load reminders from storage, falling back to defaults:', error);
    return INITIAL_REMINDERS.map((r) => enrichReminder({
      ...r,
      startDate: getTodayDateString(),
      createdAt: getTodayDateString(),
      completedDates: [],
      isDemo: true,
    }));
  }
}

/**
 * Persists full reminders array to localStorage
 */
function persistReminders(reminders: ReminderItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error('Failed to save reminders to localStorage:', error);
  }
}

/**
 * Asynchronously fetch from backend and sync with local storage.
 */
export async function syncRemindersFromBackend(): Promise<ReminderItem[]> {
  try {
    const backendReminders = await reminderApi.getAll();
    if (Array.isArray(backendReminders) && backendReminders.length > 0) {
      const todayStr = getTodayDateString();
      const enriched = backendReminders.map((r) => enrichReminder(r, todayStr));
      persistReminders(enriched);
      return enriched;
    }
  } catch {
    // Graceful offline fallback: keep using localStorage
  }
  return loadReminders();
}

/**
 * Saves a new user-confirmed reminder
 */
export function saveReminder(newReminder: ReminderItem): ReminderItem[] {
  const current = loadReminders();
  const todayStr = getTodayDateString();
  const prepared: ReminderItem = {
    ...newReminder,
    createdAt: newReminder.createdAt || todayStr,
    startDate: newReminder.startDate || todayStr,
    completedDates: newReminder.completedDates || [],
    isDemo: false,
  };

  const updated = [prepared, ...current];
  persistReminders(updated);

  // Background sync to backend
  reminderApi.create(prepared).catch((err) => {
    console.warn('Backend offline, saved reminder locally:', err.message);
  });

  return updated.map((r) => enrichReminder(r, todayStr));
}

/**
 * Updates an existing reminder
 */
export function updateReminder(updatedReminder: ReminderItem): ReminderItem[] {
  const current = loadReminders();
  const todayStr = getTodayDateString();
  const updated = current.map((r) => (r.id === updatedReminder.id ? { ...r, ...updatedReminder, isDemo: false } : r));
  persistReminders(updated);

  // Background sync to backend
  reminderApi.update(updatedReminder.id, updatedReminder).catch((err) => {
    console.warn('Backend offline, updated reminder locally:', err.message);
  });

  return updated.map((r) => enrichReminder(r, todayStr));
}

/**
 * Deletes a reminder by ID
 */
export function deleteReminder(id: string): ReminderItem[] {
  const current = loadReminders();
  const todayStr = getTodayDateString();
  const updated = current.filter((r) => r.id !== id);
  persistReminders(updated);

  // Background sync to backend
  reminderApi.delete(id).catch((err) => {
    console.warn('Backend offline, deleted reminder locally:', err.message);
  });

  return updated.map((r) => enrichReminder(r, todayStr));
}

/**
 * Toggles completion for today
 */
export function toggleReminderCompletion(
  id: string,
  dateStr = getTodayDateString()
): { reminders: ReminderItem[]; isCompleted: boolean; reminder: ReminderItem | null } {
  const current = loadReminders();
  let toggledState = false;
  let targetReminder: ReminderItem | null = null;

  const updated = current.map((r) => {
    if (r.id === id) {
      const dates = Array.isArray(r.completedDates) ? [...r.completedDates] : [];
      const existsIndex = dates.indexOf(dateStr);

      if (existsIndex >= 0) {
        // Unmark
        dates.splice(existsIndex, 1);
        toggledState = false;
      } else {
        // Mark complete
        dates.push(dateStr);
        toggledState = true;
      }

      const mod = {
        ...r,
        completedDates: dates,
      };
      targetReminder = enrichReminder(mod, dateStr);
      return mod;
    }
    return r;
  });

  persistReminders(updated);
  const enrichedList = updated.map((r) => enrichReminder(r, dateStr));

  // Background sync to backend
  reminderApi.toggleComplete(id, dateStr).catch((err) => {
    console.warn('Backend offline, toggled reminder locally:', err.message);
  });

  return {
    reminders: enrichedList,
    isCompleted: toggledState,
    reminder: targetReminder,
  };
}

/**
 * Calculates progress for today
 */
export function calculateTodayProgress(reminders: ReminderItem[], dateStr = getTodayDateString()): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = reminders.length;
  if (total === 0) return { completed: 0, total: 0, percentage: 0 };

  const completed = reminders.filter((r) => isCompletedForDate(r, dateStr)).length;
  const percentage = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
  };
}

/**
 * Finds the next upcoming uncompleted reminder for today
 */
export function findNextUpcomingReminder(reminders: ReminderItem[], dateStr = getTodayDateString()): ReminderItem | null {
  const uncompleted = reminders.filter((r) => !isCompletedForDate(r, dateStr));
  if (uncompleted.length === 0) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find next reminder after current time
  const upcomingToday = uncompleted
    .map((r) => ({ reminder: r, minutes: parseTimeToMinutes(r.time) }))
    .sort((a, b) => a.minutes - b.minutes);

  const nextFuture = upcomingToday.find((item) => item.minutes >= currentMinutes);
  if (nextFuture) return nextFuture.reminder;

  // Otherwise return the earliest uncompleted
  return upcomingToday[0].reminder;
}
