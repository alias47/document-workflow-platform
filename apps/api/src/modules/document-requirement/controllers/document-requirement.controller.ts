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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateRequirementDto } from '../dto/create-requirement.dto';
import { RequirementQueryDto } from '../dto/requirement-query.dto';
import { UpdateRequirementStatusDto } from '../dto/update-requirement-status.dto';
import { UpdateRequirementDto } from '../dto/update-requirement.dto';
import { DocumentRequirementService } from '../services/document-requirement.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Document Requirements')
@Controller('document-requirements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DocumentRequirementController {
  constructor(private readonly requirementService: DocumentRequirementService) {}

  @Get()
  @Permissions('document.view')
  @ApiOperation({ summary: 'List document requirements' })
  async list(@CurrentUser() user: JwtPayload, @Query() query: RequirementQueryDto) {
    const result = await this.requirementService.list(user.organizationId, query);
    return { success: true, message: 'Requirements retrieved', ...result };
  }

  @Get(':id')
  @Permissions('document.view')
  @ApiOperation({ summary: 'Get document requirement by ID' })
  async getById(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const req = await this.requirementService.getById(id, user.organizationId);
    return { success: true, message: 'Requirement retrieved', data: req };
  }

  @Post()
  @Permissions('document.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a document requirement' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateRequirementDto) {
    const req = await this.requirementService.create(dto, user.organizationId, user.sub);
    return { success: true, message: 'Requirement created successfully', data: req };
  }

  @Patch(':id')
  @Permissions('document.update')
  @ApiOperation({ summary: 'Update a document requirement' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequirementDto,
  ) {
    const updated = await this.requirementService.update(id, user.organizationId, dto, user.sub);
    return { success: true, message: 'Requirement updated successfully', data: updated };
  }

  @Delete(':id')
  @Permissions('document.archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a document requirement (soft delete)' })
  async archive(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    await this.requirementService.archive(id, user.organizationId, user.sub);
    return { success: true, message: 'Requirement archived successfully', data: null };
  }
}

@ApiTags('Applicant Document Requirements')
@Controller('applicant-document-requirements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ApplicantDocumentRequirementController {
  constructor(private readonly requirementService: DocumentRequirementService) {}

  @Patch(':id/status')
  @Permissions('document.update')
  @ApiOperation({ summary: 'Update the status of an applicant document requirement' })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequirementStatusDto,
  ) {
    const updated = await this.requirementService.updateApplicantRequirementStatus(
      id,
      user.organizationId,
      dto,
      user.sub,
    );
    return { success: true, message: 'Status updated successfully', data: updated };
  }
}
