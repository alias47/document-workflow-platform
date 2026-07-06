import crypto from 'node:crypto';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApplicantInvitationRepository } from '../repositories/applicant-invitation.repository';

import type { InvitationStatus } from '../dto/invitation-response.dto';

import { APP_CONFIG_KEY, type AppConfig } from '@/config/app.config';
import { ACTIVITY_TYPES } from '@/modules/activity/interfaces/activity-type';
import { ActivityService } from '@/modules/activity/services/activity.service';
import { AuditService } from '@/modules/audit/services/audit.service';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { NOTIFICATION_TEMPLATES } from '@/modules/notification/templates/notification-templates';
import { SystemSettingsService } from '@/modules/system-settings/services/system-settings.service';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService } from '@/providers/token/token.service';

const INVITATION_LIFETIME_DAYS = 7;

@Injectable()
export class ApplicantInvitationService {
  private readonly logger = new Logger(ApplicantInvitationService.name);

  constructor(
    private readonly invitationRepo: ApplicantInvitationRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly notificationService: NotificationService,
    private readonly settingsService: SystemSettingsService,
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
    private readonly config: ConfigService,
  ) {}

  async getInvitation(applicantId: string, organizationId: string) {
    const latest = await this.invitationRepo.findLatestByApplicant(applicantId, organizationId);

    const portalAccountActivated = !!latest?.portalAccount?.activatedAt;
    const portalAccountExists = !!latest;

    if (!latest) {
      return {
        status: 'none' as InvitationStatus,
        expiresAt: null,
        acceptedAt: null,
        invitedBy: null,
        createdAt: null,
        portalAccountExists: false,
        portalAccountActivated: false,
      };
    }

    return {
      status: deriveStatus(latest),
      expiresAt: latest.expiresAt.toISOString(),
      acceptedAt: latest.acceptedAt?.toISOString() ?? null,
      invitedBy: latest.createdByStaff,
      createdAt: latest.createdAt.toISOString(),
      portalAccountExists,
      portalAccountActivated,
    };
  }

  async sendInvitation(applicantId: string, organizationId: string, staffId: string) {
    const applicantData = await this.invitationRepo.findApplicant(applicantId, organizationId);
    if (!applicantData) throw new NotFoundException('Applicant not found');
    if (!applicantData.email) {
      throw new BadRequestException('Applicant does not have an email address');
    }

    // Guard: already activated
    const existing = await this.invitationRepo.findLatestByApplicant(applicantId, organizationId);
    if (existing?.portalAccount?.activatedAt) {
      throw new ConflictException('Applicant portal account is already activated');
    }

    // Guard: pending invitation already exists
    const active = await this.invitationRepo.findActiveByApplicant(applicantId, organizationId);
    if (active) {
      throw new ConflictException(
        'An active invitation already exists. Use resend to issue a new one.',
      );
    }

    const portalAccount = await this.invitationRepo.findOrCreatePortalAccount(
      organizationId,
      applicantId,
      applicantData.email,
    );

    const { rawToken, tokenHash, expiresAt } = this.generateToken();

    await this.invitationRepo.create({
      organizationId,
      applicantId,
      portalAccountId: portalAccount.id,
      tokenHash,
      expiresAt,
      createdBy: staffId,
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'invitation.created',
      resourceType: 'applicant',
      resourceId: applicantId,
    });

    void this.activityService.record({
      organizationId,
      applicantId,
      actorId: staffId,
      type: ACTIVITY_TYPES.PORTAL_INVITATION_SENT,
      title: 'Portal invitation sent',
    });

    void this.sendInvitationEmail(
      organizationId,
      applicantData,
      rawToken,
      NOTIFICATION_TEMPLATES.APPLICANT_PORTAL_INVITATION,
    );
  }

  async resendInvitation(applicantId: string, organizationId: string, staffId: string) {
    const applicantData = await this.invitationRepo.findApplicant(applicantId, organizationId);
    if (!applicantData) throw new NotFoundException('Applicant not found');
    if (!applicantData.email) {
      throw new BadRequestException('Applicant does not have an email address');
    }

    const latest = await this.invitationRepo.findLatestByApplicant(applicantId, organizationId);
    if (!latest) throw new NotFoundException('No invitation found to resend');
    if (latest.portalAccount?.activatedAt) {
      throw new ConflictException('Applicant portal account is already activated');
    }

    // Revoke all existing active invitations
    await this.invitationRepo.revokeAllActiveByApplicant(applicantId, organizationId);

    const portalAccount = await this.invitationRepo.findOrCreatePortalAccount(
      organizationId,
      applicantId,
      applicantData.email,
    );

    const { rawToken, tokenHash, expiresAt } = this.generateToken();

    await this.invitationRepo.create({
      organizationId,
      applicantId,
      portalAccountId: portalAccount.id,
      tokenHash,
      expiresAt,
      createdBy: staffId,
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'invitation.resent',
      resourceType: 'applicant',
      resourceId: applicantId,
    });

    void this.activityService.record({
      organizationId,
      applicantId,
      actorId: staffId,
      type: ACTIVITY_TYPES.PORTAL_INVITATION_SENT,
      title: 'Portal invitation resent',
    });

    void this.sendInvitationEmail(
      organizationId,
      applicantData,
      rawToken,
      NOTIFICATION_TEMPLATES.APPLICANT_INVITATION_RESENT,
    );
  }

  async revokeInvitation(applicantId: string, organizationId: string, staffId: string) {
    const active = await this.invitationRepo.findActiveByApplicant(applicantId, organizationId);
    if (!active) throw new NotFoundException('No active invitation found to revoke');

    await this.invitationRepo.revokeAllActiveByApplicant(applicantId, organizationId);

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      actorType: 'staff',
      action: 'invitation.revoked',
      resourceType: 'applicant',
      resourceId: applicantId,
    });
  }

  async validateToken(rawToken: string): Promise<{
    valid: boolean;
    reason: string | null;
    applicantName: string | null;
    organizationName: string | null;
  }> {
    const tokenHash = this.tokenService.hashToken(rawToken);
    const invitation = await this.invitationRepo.findByTokenHash(tokenHash);

    // Never reveal existence — always return the same shape
    if (!invitation) {
      return { valid: false, reason: 'invalid', applicantName: null, organizationName: null };
    }
    if (invitation.revokedAt) {
      return { valid: false, reason: 'revoked', applicantName: null, organizationName: null };
    }
    if (invitation.acceptedAt) {
      return {
        valid: false,
        reason: 'already_activated',
        applicantName: null,
        organizationName: null,
      };
    }
    if (invitation.expiresAt < new Date()) {
      return { valid: false, reason: 'expired', applicantName: null, organizationName: null };
    }

    const settings = await this.settingsService.getSettings(invitation.organizationId);
    const applicantName = `${invitation.applicant.firstName} ${invitation.applicant.lastName}`;

    return {
      valid: true,
      reason: null,
      applicantName,
      organizationName: settings.name,
    };
  }

  async activateAccount(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(rawToken);
    const invitation = await this.invitationRepo.findByTokenHash(tokenHash);

    if (!invitation) throw new BadRequestException('Invalid or expired activation token');
    if (invitation.revokedAt) throw new BadRequestException('Invitation has been revoked');
    if (invitation.acceptedAt) throw new ConflictException('Account has already been activated');
    if (invitation.expiresAt < new Date()) throw new BadRequestException('Invitation has expired');

    const passwordHash = await this.passwordService.hash(newPassword);

    await this.invitationRepo.updatePortalAccountPassword(invitation.portalAccountId, passwordHash);
    await this.invitationRepo.markAccepted(invitation.id);

    // Invalidate all remaining active invitations (one-time use)
    await this.invitationRepo.revokeAllActiveByApplicant(
      invitation.applicantId,
      invitation.organizationId,
    );

    // Revoke any existing portal sessions
    await this.invitationRepo.revokeAllPortalRefreshTokens(invitation.portalAccountId);

    void this.auditService.log({
      organizationId: invitation.organizationId,
      actorId: invitation.portalAccountId,
      actorType: 'applicant',
      action: 'invitation.accepted',
      resourceType: 'applicant',
      resourceId: invitation.applicantId,
    });

    void this.activityService.record({
      organizationId: invitation.organizationId,
      applicantId: invitation.applicantId,
      type: ACTIVITY_TYPES.PORTAL_INVITATION_ACCEPTED,
      title: 'Portal account activated',
    });
  }

  private generateToken(): { rawToken: string; tokenHash: string; expiresAt: Date } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.tokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
    return { rawToken, tokenHash, expiresAt };
  }

  private async sendInvitationEmail(
    organizationId: string,
    applicant: { firstName: string; lastName: string; email: string | null },
    rawToken: string,
    template:
      | typeof NOTIFICATION_TEMPLATES.APPLICANT_PORTAL_INVITATION
      | typeof NOTIFICATION_TEMPLATES.APPLICANT_INVITATION_RESENT,
  ): Promise<void> {
    if (!applicant.email) return;
    try {
      const settings = await this.settingsService.getSettings(organizationId);
      const appConfig = this.config.get<AppConfig>(APP_CONFIG_KEY);
      const baseUrl = appConfig?.appUrl ?? '';
      const activationLink = `${baseUrl}/applicant/activate?token=${rawToken}`;

      void this.notificationService.notify({
        organizationId,
        template,
        recipient: applicant.email as string,
        variables: {
          applicantName: `${applicant.firstName} ${applicant.lastName}`,
          organizationName: settings.name,
          activationLink,
        },
      });
    } catch (err) {
      this.logger.error('Failed to send invitation email', err);
    }
  }
}

function deriveStatus(invitation: {
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}): InvitationStatus {
  if (invitation.revokedAt) return 'revoked';
  if (invitation.acceptedAt) return 'accepted';
  if (invitation.expiresAt < new Date()) return 'expired';
  return 'pending';
}
