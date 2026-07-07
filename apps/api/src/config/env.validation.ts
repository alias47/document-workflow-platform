import Joi from 'joi';

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('v1'),

  // Database
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),

  // JWT — required so the app fails fast if not configured before auth is added
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(false),

  // Public frontend URL for notification links (falls back to CORS_ORIGIN)
  APP_URL: Joi.string().uri().optional(),

  // Force the Secure flag on auth cookies independently of NODE_ENV (optional).
  COOKIE_SECURE: Joi.boolean().optional(),

  // Multi-tenancy (MVP = single org)
  DEFAULT_ORG_ID: Joi.string().uuid().required(),

  // Email / SMTP (Mailpit in dev, real SMTP in prod)
  SMTP_HOST: Joi.string().optional().default(''),
  SMTP_PORT: Joi.number().integer().optional().default(1025),
  SMTP_USER: Joi.string().optional().allow('').default(''),
  SMTP_PASSWORD: Joi.string().optional().allow('').default(''),
  SMTP_FROM: Joi.string().optional().default('noreply@system.local'),
  SMTP_USE_TLS: Joi.boolean().optional().default(false),

  // Storage (MVP = local disk; provider swappable to R2/S3 post-pilot)
  STORAGE_PROVIDER: Joi.string().valid('local').default('local'),
  STORAGE_LOCAL_ROOT: Joi.string().default('storage'),
  STORAGE_MAX_FILE_SIZE_BYTES: Joi.number().integer().min(1).default(10485760),
});
