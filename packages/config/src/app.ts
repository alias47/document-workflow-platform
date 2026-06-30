export const APP_CONFIG = {
  NAME: 'EduFlow',
  DESCRIPTION: 'Document Workflow Platform',
  PAGINATION_DEFAULT_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
} as const;

export const API_CONFIG = {
  DEFAULT_PORT: 3001,
  PREFIX: 'api',
  VERSION: 'v1',
} as const;
