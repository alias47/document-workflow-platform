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

// --- Silent token refresh ----------------------------------------------------
// Access tokens are short-lived. When a request 401s we transparently call
// /auth/refresh (which rotates the HttpOnly cookies) exactly once and replay the
// original request. Cookies are the only auth mechanism — no token is ever read
// in JS. See docs/07 §21 and CLAUDE.md §9.

/** Endpoints that must never trigger a refresh-and-retry cycle. */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/refresh', '/auth/logout', '/auth/me'];

/** Marks a request config that has already been retried after a refresh. */
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Single-flight guard: concurrent 401s share one in-flight refresh call so we
// never fire duplicate /auth/refresh requests.
let refreshPromise: Promise<void> | null = null;

/**
 * Invoked when refresh fails (or a protected request 401s with no way to
 * recover). The auth provider registers a handler that clears user state and
 * redirects to /login. Kept as a hook so `http` has no React/router dependency.
 */
let onAuthFailure: (() => void) | null = null;

export function setAuthFailureHandler(handler: (() => void) | null): void {
  onAuthFailure = handler;
}

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

/** Fire a single shared refresh call; subsequent callers await the same promise. */
function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = http
      .post('/auth/refresh', {})
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// --- Request interceptor -----------------------------------------------------
// Cookies are attached automatically via withCredentials; this hook is the
// single place to add correlation headers or dev logging later.
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: unknown) => Promise.reject(normalizeError(error)),
);

// --- Response interceptor ----------------------------------------------------
// Pass successful responses through. On a 401 from a non-auth endpoint, attempt
// one silent refresh + replay; otherwise normalize into a safe HttpError.
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      const original = error.config as RetriableConfig | undefined;

      // Don't try to refresh for auth calls themselves, or if we already retried.
      if (original && !original._retry && !isAuthEndpoint(original.url)) {
        original._retry = true;
        try {
          await refreshSession();
          return http(original);
        } catch {
          onAuthFailure?.();
          return Promise.reject(normalizeError(error));
        }
      }

      // A failed refresh/login/me, or an already-retried request: session is gone.
      if (isAuthEndpoint(original?.url) && original?.url?.includes('/auth/refresh')) {
        onAuthFailure?.();
      }
    }
    return Promise.reject(normalizeError(error));
  },
);
