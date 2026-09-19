import { apiRequest } from './apiClient';
import { QuestionItem } from '../../types';

export const questionApi = {
  /**
   * Fetch all doctor consultation questions.
   */
  async getAll(): Promise<QuestionItem[]> {
    return apiRequest<QuestionItem[]>('/questions');
  },

  /**
   * Create a new question.
   */
  async create(question: QuestionItem): Promise<QuestionItem> {
    return apiRequest<QuestionItem>('/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
  },

  /**
   * Update question text or resolved status.
   */
  async update(id: string, updates: Partial<QuestionItem>): Promise<QuestionItem> {
    return apiRequest<QuestionItem>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a question.
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/questions/${id}`, {
      method: 'DELETE',
    });
  },
};
