export type NotificationPermissionStatus = 'default' | 'granted' | 'denied' | 'unsupported';

export interface ScheduledNotification {
  id: string;
  reminderId: string;
  title: string;
  body: string;
  scheduledTime: string; // HH:MM AM/PM
  targetTimestamp: number;
  triggered: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
