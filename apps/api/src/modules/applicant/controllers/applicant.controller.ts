import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApplicantQueryDto } from '../dto/applicant-query.dto';
import {
  ApplicantCreatedDto,
  ApplicantDetailDto,
  ApplicantListItemDto,
} from '../dto/applicant-response.dto';
import { CreateApplicantDto } from '../dto/create-applicant.dto';
import { UpdateApplicantDto } from '../dto/update-applicant.dto';
import { ApplicantService } from '../services/applicant.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { DocumentRequirementService } from '@/modules/document-requirement/services/document-requirement.service';

@ApiTags('Applicants')
@Controller('applicants')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ApplicantController {
  constructor(
    private readonly applicantService: ApplicantService,
    private readonly requirementService: DocumentRequirementService,
  ) {}

  @Get()
  @Permissions('applicant.view')
  @ApiOperation({ summary: 'List applicants with pagination, search, and filtering' })
  @ApiResponse({ status: 200, type: [ApplicantListItemDto] })
  async list(@CurrentUser() user: JwtPayload, @Query() query: ApplicantQueryDto) {
    const result = await this.applicantService.list(user.organizationId, query);
    return { success: true, message: 'Applicants retrieved', ...result };
  }

  @Get(':id')
  @Permissions('applicant.view')
  @ApiOperation({ summary: 'Get applicant by ID' })
  @ApiResponse({ status: 200, type: ApplicantDetailDto })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async getById(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const applicant = await this.applicantService.getById(id, user.organizationId);
    return { success: true, message: 'Applicant retrieved', data: applicant };
  }

  @Post()
  @Permissions('applicant.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new applicant with primary staff assignment' })
  @ApiResponse({ status: 201, type: ApplicantCreatedDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateApplicantDto) {
    const result = await this.applicantService.create(dto, user.organizationId, user.sub);
    return { success: true, message: 'Applicant created successfully', data: result };
  }

  @Patch(':id')
  @Permissions('applicant.update')
  @ApiOperation({ summary: 'Update applicant profile fields' })
  @ApiResponse({ status: 200, type: ApplicantDetailDto })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicantDto,
  ) {
    const updated = await this.applicantService.update(id, user.organizationId, dto, user.sub);
    return { success: true, message: 'Applicant updated successfully', data: updated };
  }

  @Delete(':id')
  @Permissions('applicant.archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive applicant (soft delete)' })
  @ApiResponse({ status: 200, description: 'Applicant archived' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async archive(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    await this.applicantService.archive(id, user.organizationId, user.sub);
    return { success: true, message: 'Applicant archived successfully', data: null };
  }

  @Get(':id/document-requirements')
  @Permissions('document.view')
  @ApiOperation({ summary: "List an applicant's document requirements" })
  async listDocumentRequirements(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.requirementService.listApplicantRequirements(id, user.organizationId);
    return { success: true, message: 'Applicant document requirements retrieved', data };
  }

  @Post(':id/document-requirements/sync')
  @Permissions('document.create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync active document requirements onto an applicant' })
  async syncDocumentRequirements(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.requirementService.syncApplicantRequirements(id, user.organizationId, user.sub);
    return { success: true, message: 'Document requirements synced', data: null };
  }
}
