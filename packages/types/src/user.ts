export type UserRole = 'ADMIN' | 'CONSULTANT' | 'APPLICANT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
