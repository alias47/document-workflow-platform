export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CONSULTANT: 'CONSULTANT',
  APPLICANT: 'APPLICANT',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  CONSULTANT: 'Consultant',
  APPLICANT: 'Applicant',
};
