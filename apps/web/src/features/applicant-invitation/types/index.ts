export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked' | 'none';

export interface InvitedBy {
  id: string;
  firstName: string;
  lastName: string;
}

export interface InvitationInfo {
  status: InvitationStatus;
  expiresAt: string | null;
  acceptedAt: string | null;
  invitedBy: InvitedBy | null;
  createdAt: string | null;
  portalAccountExists: boolean;
  portalAccountActivated: boolean;
}

export interface ValidateTokenResult {
  valid: boolean;
  reason: string | null;
  applicantName: string | null;
  organizationName: string | null;
}
