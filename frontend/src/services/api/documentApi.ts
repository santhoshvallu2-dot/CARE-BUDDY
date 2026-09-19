import { apiRequest } from './apiClient';
import { DocumentItem, CareAnalysisResult } from '../../types';

export const documentApi = {
  /**
   * Fetch all documents from the backend.
   */
  async getAll(): Promise<DocumentItem[]> {
    return apiRequest<DocumentItem[]>('/documents');
  },

  /**
   * Fetch a single document by ID.
   */
  async getById(id: string): Promise<DocumentItem> {
    return apiRequest<DocumentItem>(`/documents/${id}`);
  },

  /**
   * Create or update a document in the backend database.
   */
  async create(doc: DocumentItem): Promise<DocumentItem> {
    return apiRequest<DocumentItem>('/documents', {
      method: 'POST',
      body: JSON.stringify(doc),
    });
  },

  /**
   * Update metadata of an existing document.
   */
  async update(id: string, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    return apiRequest<DocumentItem>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a document.
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Save AI analysis for a document.
   */
  async saveAnalysis(docId: string, analysis: CareAnalysisResult): Promise<any> {
    return apiRequest<any>(`/documents/${docId}/analysis`, {
      method: 'POST',
      body: JSON.stringify(analysis),
    });
  },
};
