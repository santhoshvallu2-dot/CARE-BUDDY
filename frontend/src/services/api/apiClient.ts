/**
 * Unified API Client for CareBuddy AI backend.
 * Provides timeout safety, JSON serialization, and graceful error handling.
 */

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

const DEFAULT_TIMEOUT_MS = 4000;

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Perform an HTTP request with automatic timeout and error classification.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: response.statusText };
      }
      throw new ApiError(
        errorData?.detail || `API request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return (await response.json()) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out while connecting to CareBuddy backend.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err?.message || 'Unable to connect to CareBuddy backend. Using local storage.',
      0
    );
  }
}

/**
 * Health check to verify backend connectivity.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await apiRequest<{ status: string }>('/health');
    return res?.status === 'ok';
  } catch {
    return false;
  }
}
