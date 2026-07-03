export interface ApplicantJwtPayload {
  sub: string;
  applicantId: string;
  organizationId: string;
  email: string;
  type: 'applicant';
}
