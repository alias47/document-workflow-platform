import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UpdateApplicantProfileDto } from '../dto/update-applicant-profile.dto';
import { ApplicantPortalService } from '../services/applicant-portal.service';

import type { ApplicantJwtPayload } from '@/modules/applicant-auth/interfaces/applicant-jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApplicantJwtGuard } from '@/modules/applicant-auth/guards/applicant-jwt.guard';

@ApiTags('Applicant Portal')
@Controller('applicant')
@Public()
@UseGuards(ApplicantJwtGuard)
@ApiCookieAuth()
export class ApplicantPortalController {
  constructor(private readonly portalService: ApplicantPortalService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get applicant dashboard summary' })
  async getDashboard(@CurrentUser() user: ApplicantJwtPayload) {
    const data = await this.portalService.getDashboard(user.applicantId, user.organizationId);
    return { success: true, message: 'Dashboard retrieved', data };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get applicant profile' })
  async getProfile(@CurrentUser() user: ApplicantJwtPayload) {
    const data = await this.portalService.getProfile(user.applicantId, user.organizationId);
    return { success: true, message: 'Profile retrieved', data };
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update editable applicant profile fields' })
  async updateProfile(
    @CurrentUser() user: ApplicantJwtPayload,
    @Body() dto: UpdateApplicantProfileDto,
  ) {
    const data = await this.portalService.updateProfile(user.applicantId, user.organizationId, dto);
    return { success: true, message: 'Profile updated', data };
  }

  @Get('document-requirements')
  @ApiOperation({ summary: 'Get applicant document requirements' })
  async getDocumentRequirements(@CurrentUser() user: ApplicantJwtPayload) {
    const data = await this.portalService.getDocumentRequirements(
      user.applicantId,
      user.organizationId,
    );
    return { success: true, message: 'Document requirements retrieved', data };
  }

  @Post('documents/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document against a requirement' })
  async uploadDocument(
    @CurrentUser() user: ApplicantJwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Query('requirementId') requirementId: string,
  ) {
    const data = await this.portalService.uploadDocument(
      file,
      user.applicantId,
      user.organizationId,
      requirementId,
    );
    return { success: true, message: 'Document uploaded', data };
  }
}
