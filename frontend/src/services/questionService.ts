import { QuestionItem } from '../types';
import { INITIAL_QUESTIONS } from '../data/mockData';
import { questionApi } from './api/questionApi';

const QUESTIONS_STORAGE_KEY = 'carebuddy_questions_v1';

/**
 * Load questions from localStorage, falling back to initial seed data.
 */
export function loadQuestions(): QuestionItem[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial questions
      saveQuestions(INITIAL_QUESTIONS);
      return INITIAL_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_QUESTIONS;
  } catch (err) {
    console.warn('Failed to load questions from localStorage, using initial mock:', err);
    return INITIAL_QUESTIONS;
  }
}

/**
 * Persist questions array to localStorage.
 */
export function saveQuestions(questions: QuestionItem[]): void {
  try {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions to localStorage:', err);
  }
}

/**
 * Asynchronously fetch from backend and sync with local storage.
 */
export async function syncQuestionsFromBackend(): Promise<QuestionItem[]> {
  try {
    const backendQuestions = await questionApi.getAll();
    if (Array.isArray(backendQuestions) && backendQuestions.length > 0) {
      saveQuestions(backendQuestions);
      return backendQuestions;
    }
  } catch {
    // Graceful offline fallback: keep using localStorage
  }
  return loadQuestions();
}

/**
 * Add a new user-created question.
 */
export function addQuestion(newQuestion: QuestionItem): QuestionItem[] {
  const current = loadQuestions();
  const updated = [newQuestion, ...current];
  saveQuestions(updated);

  // Background sync to backend
  questionApi.create(newQuestion).catch((err) => {
    console.warn('Backend offline, saved question locally:', err.message);
  });

  return updated;
}

/**
 * Ingest questions extracted by AI from a reviewed healthcare document.
 * Avoids duplicate question strings and attaches source document metadata.
 */
export function addQuestionsFromAI(
  aiQuestions: string[],
  sourceDocTitle: string,
  _sourceDocId?: string
): { updatedQuestions: QuestionItem[]; addedCount: number } {
  if (!aiQuestions || aiQuestions.length === 0) {
    return { updatedQuestions: loadQuestions(), addedCount: 0 };
  }

  const current = loadQuestions();
  const existingTexts = new Set(current.map((q) => q.question.trim().toLowerCase()));

  const newItems: QuestionItem[] = [];

  aiQuestions.forEach((qText) => {
    const trimmed = qText.trim();
    if (trimmed && !existingTexts.has(trimmed.toLowerCase())) {
      const qItem: QuestionItem = {
        id: `q-ai-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        question: trimmed,
        sourceDoc: sourceDocTitle || 'Scanned Document',
        category: 'Doctor Discussion',
        resolved: false,
        createdAt: 'Today',
      };
      newItems.push(qItem);
      existingTexts.add(trimmed.toLowerCase());

      // Background sync to backend
      questionApi.create(qItem).catch((err) => {
        console.warn('Backend offline, saved AI question locally:', err.message);
      });
    }
  });

  if (newItems.length > 0) {
    const updated = [...newItems, ...current];
    saveQuestions(updated);
    return { updatedQuestions: updated, addedCount: newItems.length };
  }

  return { updatedQuestions: current, addedCount: 0 };
}

/**
 * Toggle the resolved (discussed) status of a question.
 */
export function toggleQuestion(
  id: string
): { questions: QuestionItem[]; toggledQuestion: QuestionItem | null } {
  const current = loadQuestions();
  let toggled: QuestionItem | null = null;

  const updated = current.map((q) => {
    if (q.id === id) {
      toggled = { ...q, resolved: !q.resolved };
      return toggled;
    }
    return q;
  });

  saveQuestions(updated);

  if (toggled) {
    const isRes = (toggled as QuestionItem).resolved;
    questionApi.update(id, { resolved: isRes }).catch((err) => {
      console.warn('Backend offline, updated question status locally:', err.message);
    });
  }

  return { questions: updated, toggledQuestion: toggled };
}

/**
 * Delete a question by its ID.
 */
export function deleteQuestion(id: string): QuestionItem[] {
  const current = loadQuestions();
  const updated = current.filter((q) => q.id !== id);
  saveQuestions(updated);

  // Background sync to backend
  questionApi.delete(id).catch((err) => {
    console.warn('Backend offline, deleted question locally:', err.message);
  });

  return updated;
}

/**
 * Compute counts of active (to discuss) and discussed questions.
 */
export function getQuestionStats(questions: QuestionItem[]): {
  activeCount: number;
  discussedCount: number;
  totalCount: number;
} {
  const activeCount = questions.filter((q) => !q.resolved).length;
  const discussedCount = questions.filter((q) => q.resolved).length;
  return {
    activeCount,
    discussedCount,
    totalCount: questions.length,
  };
}
