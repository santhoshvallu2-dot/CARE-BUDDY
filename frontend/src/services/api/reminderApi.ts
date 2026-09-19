import { apiRequest } from './apiClient';
import { ReminderItem } from '../../types';

export const reminderApi = {
  /**
   * Fetch all reminders from the backend.
   */
  async getAll(): Promise<ReminderItem[]> {
    return apiRequest<ReminderItem[]>('/reminders');
  },

  /**
   * Fetch a single reminder by ID.
   */
  async getById(id: string): Promise<ReminderItem> {
    return apiRequest<ReminderItem>(`/reminders/${id}`);
  },

  /**
   * Create a new reminder.
   */
  async create(reminder: ReminderItem): Promise<ReminderItem> {
    return apiRequest<ReminderItem>('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder),
    });
  },

  /**
   * Update an existing reminder.
   */
  async update(id: string, updates: Partial<ReminderItem>): Promise<ReminderItem> {
    return apiRequest<ReminderItem>(`/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a reminder.
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/reminders/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle completion for a specific date string (YYYY-MM-DD).
   */
  async toggleComplete(id: string, date: string): Promise<ReminderItem> {
    return apiRequest<ReminderItem>(`/reminders/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },
};
