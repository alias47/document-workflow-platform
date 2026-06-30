/**
 * Shared API contract types.
 *
 * These mirror the backend envelopes documented in CLAUDE.md §13 and
 * docs/06_API_SPECIFICATION.md. Every service reuses these types so the
 * frontend and backend stay in lockstep.
 *
 * Success envelope: { success, message, data, meta? }
 * Error envelope:   { success: false, message, errors? }
 */

/** Standard success envelope for a single resource. */
export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

/** Pagination metadata returned by every list endpoint. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Standard success envelope for a paginated collection. */
export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

/** A single field-level validation failure. */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Normalized error shape surfaced to the UI. The raw backend payload is never
 * exposed directly — `message` is a safe, user-facing string chosen by the
 * HTTP layer based on the status code.
 */
export interface ApiError {
  success: false;
  /** HTTP status code (0 when the request never reached the server). */
  status: number;
  /** Safe, user-facing message. Never the raw backend/server message. */
  message: string;
  /** Field-level validation errors, when the status is 422/400. */
  errors?: ValidationError[];
}
