import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UpdateApplicantProfileDto } from '../dto/update-applicant-profile.dto';
import { ApplicantPortalService } from '../services/applicant-portal.service';

import type { ApplicantJwtPayload } from '@/modules/applicant-auth/interfaces/applicant-jwt-payload.interface';
import type { Response } from 'express';

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

  @Get('documents')
  @ApiOperation({ summary: 'List all documents uploaded by the applicant' })
  async listDocuments(
    @CurrentUser() user: ApplicantJwtPayload,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
  ) {
    const result = await this.portalService.listDocuments(
      user.applicantId,
      user.organizationId,
      page ?? 1,
      pageSize ?? 25,
    );
    return { success: true, message: 'Documents retrieved', ...result };
  }

  @Get('documents/:id/download')
  @Header('Content-Disposition', 'attachment')
  @ApiOperation({ summary: 'Download an uploaded document' })
  async downloadDocument(
    @CurrentUser() user: ApplicantJwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, filename, contentType } = await this.portalService.downloadDocument(
      id,
      user.applicantId,
      user.organizationId,
    );
    const safeName = encodeURIComponent(filename);
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Type', contentType);
    return new StreamableFile(stream, { type: contentType });
  }
}
