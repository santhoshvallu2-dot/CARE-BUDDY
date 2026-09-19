import { ReminderItem } from '../../types';
import { NotificationPermissionStatus, NotificationSettings } from './notificationTypes';
import { isCompletedForDate, getTodayDateString } from '../reminderService';

const NOTIFICATION_SETTINGS_KEY = 'carebuddy_notification_settings';
const NOTIFIED_RECORDS_KEY = 'carebuddy_notified_reminders';

export class NotificationService {
  /**
   * Check if browser notifications are supported
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current notification permission status
   */
  public static getPermission(): NotificationPermissionStatus {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as NotificationPermissionStatus;
  }

  /**
   * Request permission from the user (must only be invoked from explicit user action)
   */
  public static async requestPermission(): Promise<NotificationPermissionStatus> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermissionStatus;
    } catch {
      return 'denied';
    }
  }

  /**
   * Load notification preferences
   */
  public static getSettings(): NotificationSettings {
    try {
      const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return {
      enabled: false,
      sound: true,
    };
  }

  /**
   * Save notification preferences
   */
  public static saveSettings(settings: NotificationSettings): void {
    try {
      localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore localstorage errors
    }
  }

  /**
   * Play a peaceful, gentle chime via Web Audio API
   */
  public static playGentleChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Soft dual harmonic tone (calm healthcare chime)
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now); // E5
      osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch {
      // Audio not supported or blocked
    }
  }

  /**
   * Show a safe, confirmed reminder notification
   */
  public static async showReminderNotification(
    reminder: ReminderItem,
    withSound: boolean = true
  ): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    if (withSound) {
      this.playGentleChime();
    }

    const title = `CareBuddy Routine Reminder: ${reminder.title}`;
    const options: NotificationOptions = {
      body: `Scheduled for ${reminder.time}. ${reminder.instruction}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: `carebuddy-reminder-${reminder.id}`,
      requireInteraction: false,
    };

    // Try service worker notification first for better mobile OS integration
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, options);
          return true;
        }
      } catch {
        // Fall back to standard Notification
      }
    }

    try {
      new Notification(title, options);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Evaluate if any confirmed reminders are due in the current time window
   */
  public static checkDueReminders(reminders: ReminderItem[], soundEnabled: boolean = true): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    const todayStr = getTodayDateString();
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = this.formatTime12Hour(currentHours, currentMinutes);

    const notifiedMap = this.getNotifiedMap();

    reminders.forEach((reminder) => {
      // Ignore if already completed today
      if (isCompletedForDate(reminder)) return;

      // Check if matches current time
      const reminderTimeNormalized = reminder.time.trim().toUpperCase();
      const currentNormalized = currentTimeStr.trim().toUpperCase();

      const notifKey = `${todayStr}_${reminder.id}_${reminderTimeNormalized}`;

      if (reminderTimeNormalized === currentNormalized && !notifiedMap[notifKey]) {
        notifiedMap[notifKey] = true;
        this.saveNotifiedMap(notifiedMap);
        this.showReminderNotification(reminder, soundEnabled);
      }
    });
  }

  private static formatTime12Hour(hours: number, minutes: number): string {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${displayHours}:${displayMinutes} ${period}`;
  }

  private static getNotifiedMap(): Record<string, boolean> {
    try {
      const stored = sessionStorage.getItem(NOTIFIED_RECORDS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {};
  }

  private static saveNotifiedMap(map: Record<string, boolean>): void {
    try {
      sessionStorage.setItem(NOTIFIED_RECORDS_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  }
}
