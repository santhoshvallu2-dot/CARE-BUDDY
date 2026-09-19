import { DocumentItem } from '../types';
import { INITIAL_DOCUMENTS } from '../data/mockData';
import { documentApi } from './api/documentApi';

const DOCUMENTS_STORAGE_KEY = 'carebuddy_saved_documents_v1';

/**
 * Load documents from localStorage, falling back to initial mock seed data.
 */
export function loadDocuments(): DocumentItem[] {
  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) {
      persistDocuments(INITIAL_DOCUMENTS);
      return INITIAL_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DOCUMENTS;
  } catch (err) {
    console.warn('Failed to load documents from localStorage, using initial mock:', err);
    return INITIAL_DOCUMENTS;
  }
}

/**
 * Persist documents array to localStorage.
 */
export function persistDocuments(documents: DocumentItem[]): void {
  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
  } catch (err) {
    console.error('Failed to save documents to localStorage:', err);
  }
}

/**
 * Asynchronously fetch from backend and sync with local storage.
 */
export async function syncDocumentsFromBackend(): Promise<DocumentItem[]> {
  try {
    const backendDocs = await documentApi.getAll();
    if (Array.isArray(backendDocs) && backendDocs.length > 0) {
      persistDocuments(backendDocs);
      return backendDocs;
    }
  } catch {
    // Graceful offline fallback: keep using localStorage
  }
  return loadDocuments();
}

/**
 * Save a newly verified document.
 */
export function saveDocument(newDoc: DocumentItem): DocumentItem[] {
  const current = loadDocuments();
  const updated = [newDoc, ...current];
  persistDocuments(updated);

  // Background sync to backend
  documentApi.create(newDoc).catch((err) => {
    console.warn('Backend offline, saved document locally:', err.message);
  });

  return updated;
}

/**
 * Delete a document.
 */
export function deleteDocument(id: string): DocumentItem[] {
  const current = loadDocuments();
  const updated = current.filter((d) => d.id !== id);
  persistDocuments(updated);

  // Background sync to backend
  documentApi.delete(id).catch((err) => {
    console.warn('Backend offline, deleted document locally:', err.message);
  });

  return updated;
}
