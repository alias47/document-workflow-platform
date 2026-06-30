import { env } from '@/lib/env';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) {
    const err = body as ApiError;
    throw new HttpError(res.status, err.message ?? 'Request failed', err.errors);
  }
  return body as T;
}

function getAuthHeaders(): HeadersInit {
  // Tokens will be in HTTP-only cookies — no manual header needed in production.
  // This stub lets us add Authorization header during development/testing.
  return { 'Content-Type': 'application/json' };
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return fetch(`${env.apiUrl}${path}`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(),
    }).then((r) => parseResponse<T>(r));
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${env.apiUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then((r) => parseResponse<T>(r));
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return fetch(`${env.apiUrl}${path}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    }).then((r) => parseResponse<T>(r));
  },

  delete<T>(path: string): Promise<T> {
    return fetch(`${env.apiUrl}${path}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(),
    }).then((r) => parseResponse<T>(r));
  },
};
