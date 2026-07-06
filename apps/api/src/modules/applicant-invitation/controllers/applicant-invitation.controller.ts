import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ActivateAccountDto } from '../dto/activate-account.dto';
import { ApplicantInvitationService } from '../services/applicant-invitation.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Applicant Invitations')
@Controller()
export class ApplicantInvitationController {
  constructor(private readonly invitationService: ApplicantInvitationService) {}

  // ─── Staff endpoints ──────────────────────────────────────────────────────

  @Get('applicants/:id/invitation')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invitation status for an applicant' })
  async getInvitation(
    @Param('id', ParseUUIDPipe) applicantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.invitationService.getInvitation(applicantId, user.organizationId);
    return { success: true, message: 'Invitation retrieved', data };
  }

  @Post('applicants/:id/invitation')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a portal invitation to an applicant' })
  async sendInvitation(
    @Param('id', ParseUUIDPipe) applicantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.invitationService.sendInvitation(applicantId, user.organizationId, user.sub);
    return { success: true, message: 'Invitation sent', data: null };
  }

  @Post('applicants/:id/invitation/resend')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend portal invitation (revokes old, creates new)' })
  async resendInvitation(
    @Param('id', ParseUUIDPipe) applicantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.invitationService.resendInvitation(applicantId, user.organizationId, user.sub);
    return { success: true, message: 'Invitation resent', data: null };
  }

  @Post('applicants/:id/invitation/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke active invitation for an applicant' })
  async revokeInvitation(
    @Param('id', ParseUUIDPipe) applicantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.invitationService.revokeInvitation(applicantId, user.organizationId, user.sub);
    return { success: true, message: 'Invitation revoked', data: null };
  }

  // ─── Applicant public endpoints ───────────────────────────────────────────

  @Get('applicant/activate')
  @Public()
  @ApiOperation({ summary: 'Validate an activation token (public)' })
  @ApiQuery({ name: 'token', type: String })
  async validateToken(@Query('token') token: string) {
    const data = await this.invitationService.validateToken(token ?? '');
    return { success: true, message: 'Token validated', data };
  }

  @Post('applicant/activate')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate applicant portal account (public)' })
  async activateAccount(@Body() dto: ActivateAccountDto) {
    await this.invitationService.activateAccount(dto.token, dto.password);
    return { success: true, message: 'Account activated successfully', data: null };
  }
}
