/**
 * Canonical set of applicant activity types (TASK 8.4).
 *
 * Kept industry-neutral like every backend concept. Business modules reference
 * these constants via ActivityService rather than passing raw strings, so a
 * typo can't silently create an unknown activity type.
 */
export const ACTIVITY_TYPES = {
  APPLICANT_CREATED: 'applicant.created',
  APPLICANT_UPDATED: 'applicant.updated',
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_DELETED: 'document.deleted',
  DOCUMENT_VERIFIED: 'document.verified',
  DOCUMENT_REJECTED: 'document.rejected',
  NOTE_CREATED: 'note.created',
  NOTE_UPDATED: 'note.updated',
  NOTE_DELETED: 'note.deleted',
  WORKFLOW_STAGE_CHANGED: 'workflow.stage_changed',
  SYSTEM_CREATED: 'system.created',
} as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES];
