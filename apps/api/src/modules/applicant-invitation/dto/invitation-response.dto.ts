export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked' | 'none';

export class InvitationResponseDto {
  status!: InvitationStatus;
  expiresAt!: string | null;
  acceptedAt!: string | null;
  invitedBy!: { id: string; firstName: string; lastName: string } | null;
  createdAt!: string | null;
  portalAccountExists!: boolean;
  portalAccountActivated!: boolean;
}
