import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { ApiError, ValidationError } from '@/types/api';

import { env } from '@/lib/env';

/**
 * Single shared Axios instance. Nothing outside this module should import
 * `axios` directly — services depend on `http` and components depend on
 * services (docs/07_FRONTEND_ARCHITECTURE.md §4, §14).
 *
 * Authentication uses HTTP-only cookies, so `withCredentials` is enabled and
 * no token is ever read or attached in JavaScript.
 */
export const http: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Error thrown by the HTTP layer with a safe, user-facing message. Carries the
 * same fields as {@link ApiError}; `toApiError()` returns the plain shape.
 */
export class HttpError extends Error {
  readonly success = false as const;

  constructor(
    readonly status: number,
    message: string,
    readonly errors?: ValidationError[],
  ) {
    super(message);
    this.name = 'HttpError';
  }

  toApiError(): ApiError {
    return {
      success: false,
      status: this.status,
      message: this.message,
      ...(this.errors ? { errors: this.errors } : {}),
    };
  }
}

/**
 * Safe, user-facing messages keyed by status. Raw backend/server messages are
 * never surfaced to the UI (docs/07 §21, §27).
 */
const SAFE_MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'The request was invalid. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource could not be found.',
  409: 'This action conflicts with the current state. Please refresh and retry.',
  422: 'Some fields need your attention.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
};

const NETWORK_ERROR_MESSAGE =
  'Unable to connect to the server. Please check your connection and try again.';
const UNKNOWN_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

/** Pull field-level validation errors out of the backend error envelope. */
function extractValidationErrors(data: unknown): ValidationError[] | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const errors = (data as { errors?: unknown }).errors;
  if (!errors || typeof errors !== 'object') return undefined;

  // Backend shape: { errors: { field: ["msg", ...] } }
  return Object.entries(errors as Record<string, unknown>).flatMap(([field, messages]) =>
    (Array.isArray(messages) ? messages : [messages]).map((message) => ({
      field,
      message: String(message),
    })),
  );
}

/** Map any thrown value into a normalized, safe `HttpError`. */
function normalizeError(error: unknown): HttpError {
  if (!(error instanceof AxiosError)) {
    return new HttpError(0, UNKNOWN_ERROR_MESSAGE);
  }

  // Request was made but no response received (network/timeout/CORS).
  if (!error.response) {
    return new HttpError(0, NETWORK_ERROR_MESSAGE);
  }

  const { status, data } = error.response;
  const message = SAFE_MESSAGE_BY_STATUS[status] ?? UNKNOWN_ERROR_MESSAGE;
  return new HttpError(status, message, extractValidationErrors(data));
}

// --- Request interceptor -----------------------------------------------------
// Cookies are attached automatically via withCredentials; this hook is the
// single place to add correlation headers or dev logging later.
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: unknown) => Promise.reject(normalizeError(error)),
);

// --- Response interceptor ----------------------------------------------------
// Pass successful responses straight through; normalize every failure into a
// safe HttpError so callers never see raw backend messages.
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => Promise.reject(normalizeError(error)),
);
