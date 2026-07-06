/**
 * Notification template registry (Sprint 11.2 §11.2.2).
 *
 * Each template is a pure function of a variable bag → { subject, html }. Keeping
 * templates industry-neutral and centralized means business modules only pick a
 * template key + supply variables; they never assemble email copy inline. New
 * channels (SMS/push) can later add their own renderers keyed by the same enum.
 *
 * Variables are interpolated with the {{token}} syntax. Unknown tokens render as
 * an empty string so a missing variable never leaks `{{raw}}` into an email.
 */

export const NOTIFICATION_TEMPLATES = {
  STAFF_WELCOME: 'staff_welcome',
  APPLICANT_PORTAL_INVITATION: 'applicant_portal_invitation',
  APPLICANT_PASSWORD_RESET: 'applicant_password_reset',
  STAFF_PASSWORD_RESET: 'staff_password_reset',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_APPROVED: 'document_approved',
  DOCUMENT_REJECTED: 'document_rejected',
  NEW_DOCUMENT_REQUIREMENT_ASSIGNED: 'new_document_requirement_assigned',
  APPLICANT_ASSIGNED_TO_STAFF: 'applicant_assigned_to_staff',
  APPLICANT_WORKFLOW_STAGE_CHANGED: 'applicant_workflow_stage_changed',
} as const;

export type NotificationTemplateKey =
  (typeof NOTIFICATION_TEMPLATES)[keyof typeof NOTIFICATION_TEMPLATES];

/** Free-form interpolation bag. Values are stringified before substitution. */
export type TemplateVariables = Record<string, string | number | undefined>;

export interface RenderedTemplate {
  subject: string;
  html: string;
}

interface TemplateDefinition {
  subject: string;
  /** HTML body with {{token}} placeholders. */
  body: string;
}

const TEMPLATE_DEFINITIONS: Record<NotificationTemplateKey, TemplateDefinition> = {
  [NOTIFICATION_TEMPLATES.STAFF_WELCOME]: {
    subject: 'Welcome to {{consultancyName}}',
    body: '<p>Hello {{staffName}},</p><p>An account has been created for you at {{consultancyName}}. Sign in to get started.</p><p><a href="{{portalUrl}}">Go to dashboard</a></p>',
  },
  [NOTIFICATION_TEMPLATES.APPLICANT_PORTAL_INVITATION]: {
    subject: 'You have been invited to the {{consultancyName}} portal',
    body: '<p>Hello {{applicantName}},</p><p>{{consultancyName}} has created a portal account for you. Use the link below to set your password and get started.</p><p><a href="{{portalUrl}}">Access your portal</a></p>',
  },
  [NOTIFICATION_TEMPLATES.APPLICANT_PASSWORD_RESET]: {
    subject: 'Reset your {{consultancyName}} portal password',
    body: '<p>Hello {{applicantName}},</p><p>We received a request to reset your portal password. Use the link below to continue. If you did not request this, you can ignore this email.</p><p><a href="{{portalUrl}}">Reset password</a></p>',
  },
  [NOTIFICATION_TEMPLATES.STAFF_PASSWORD_RESET]: {
    subject: 'Reset your {{consultancyName}} password',
    body: '<p>Hello {{staffName}},</p><p>We received a request to reset your password. Use the link below to continue. If you did not request this, you can ignore this email.</p><p><a href="{{portalUrl}}">Reset password</a></p>',
  },
  [NOTIFICATION_TEMPLATES.DOCUMENT_UPLOADED]: {
    subject: 'A document was uploaded for {{applicantName}}',
    body: '<p>Hello {{staffName}},</p><p>The document "{{documentName}}" was uploaded for {{applicantName}}.</p><p><a href="{{portalUrl}}">Review document</a></p>',
  },
  [NOTIFICATION_TEMPLATES.DOCUMENT_APPROVED]: {
    subject: 'Your document has been approved',
    body: '<p>Hello {{applicantName}},</p><p>Your document "{{documentName}}" has been approved by {{consultancyName}}.</p><p><a href="{{portalUrl}}">View in portal</a></p>',
  },
  [NOTIFICATION_TEMPLATES.DOCUMENT_REJECTED]: {
    subject: 'Action needed: your document was rejected',
    body: '<p>Hello {{applicantName}},</p><p>Your document "{{documentName}}" was rejected. Please review the notes and re-upload a corrected version.</p><p><a href="{{portalUrl}}">View in portal</a></p>',
  },
  [NOTIFICATION_TEMPLATES.NEW_DOCUMENT_REQUIREMENT_ASSIGNED]: {
    subject: 'A new document is required',
    body: '<p>Hello {{applicantName}},</p><p>{{consultancyName}} requires a new document: "{{documentName}}". Please upload it at your earliest convenience.</p><p><a href="{{portalUrl}}">Upload document</a></p>',
  },
  [NOTIFICATION_TEMPLATES.APPLICANT_ASSIGNED_TO_STAFF]: {
    subject: 'A new applicant has been assigned to you',
    body: '<p>Hello {{staffName}},</p><p>{{applicantName}} has been assigned to you at {{consultancyName}}.</p><p><a href="{{portalUrl}}">View applicant</a></p>',
  },
  [NOTIFICATION_TEMPLATES.APPLICANT_WORKFLOW_STAGE_CHANGED]: {
    subject: 'Your application has moved to a new stage',
    body: '<p>Hello {{applicantName}},</p><p>Your application at {{consultancyName}} has moved to the "{{workflowStage}}" stage.</p><p><a href="{{portalUrl}}">View progress</a></p>',
  },
};

const TOKEN_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

/** Replace every {{token}} with its variable value; unknown tokens become ''. */
function interpolate(template: string, variables: TemplateVariables): string {
  return template.replace(TOKEN_PATTERN, (_match, key: string) => {
    const value = variables[key];
    return value === undefined ? '' : String(value);
  });
}

export function isValidTemplateKey(key: string): key is NotificationTemplateKey {
  return Object.values(NOTIFICATION_TEMPLATES).includes(key as NotificationTemplateKey);
}

/** Render a template key + variable bag into a concrete subject and HTML body. */
export function renderTemplate(
  key: NotificationTemplateKey,
  variables: TemplateVariables,
): RenderedTemplate {
  const definition = TEMPLATE_DEFINITIONS[key];
  return {
    subject: interpolate(definition.subject, variables),
    html: interpolate(definition.body, variables),
  };
}
