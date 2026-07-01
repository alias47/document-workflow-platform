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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateWorkflowStageDto } from '../dto/create-workflow-stage.dto';
import { UpdateApplicantWorkflowDto } from '../dto/update-applicant-workflow.dto';
import { UpdateWorkflowStageDto } from '../dto/update-workflow-stage.dto';
import {
  ApplicantWorkflowDto,
  WorkflowHistoryItemDto,
  WorkflowStageDto,
} from '../dto/workflow-response.dto';
import { WorkflowService } from '../services/workflow.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Workflow')
@Controller('workflow')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // --- Stages -------------------------------------------------------------

  @Get('stages')
  @Permissions('workflow.view')
  @ApiOperation({ summary: 'List all workflow stages for the organization' })
  @ApiResponse({ status: 200, type: [WorkflowStageDto] })
  async listStages(@CurrentUser() user: JwtPayload) {
    const data = await this.workflowService.listStages(user.organizationId);
    return { success: true, message: 'Workflow stages retrieved', data };
  }

  @Post('stages')
  @Permissions('workflow.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new workflow stage' })
  @ApiResponse({ status: 201, type: WorkflowStageDto })
  async createStage(@CurrentUser() user: JwtPayload, @Body() dto: CreateWorkflowStageDto) {
    const data = await this.workflowService.createStage(dto, user.organizationId, user.sub);
    return { success: true, message: 'Workflow stage created successfully', data };
  }

  @Patch('stages/:id')
  @Permissions('workflow.update')
  @ApiOperation({ summary: 'Update a workflow stage' })
  @ApiResponse({ status: 200, type: WorkflowStageDto })
  @ApiResponse({ status: 404, description: 'Workflow stage not found' })
  async updateStage(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkflowStageDto,
  ) {
    const data = await this.workflowService.updateStage(id, user.organizationId, dto, user.sub);
    return { success: true, message: 'Workflow stage updated successfully', data };
  }

  @Delete('stages/:id')
  @Permissions('workflow.archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a workflow stage (soft delete)' })
  @ApiResponse({ status: 200, description: 'Workflow stage archived' })
  @ApiResponse({ status: 404, description: 'Workflow stage not found' })
  @ApiResponse({ status: 409, description: 'Stage is currently assigned to applicants' })
  async archiveStage(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    await this.workflowService.archiveStage(id, user.organizationId, user.sub);
    return { success: true, message: 'Workflow stage archived successfully', data: null };
  }

  // --- Applicant workflow -------------------------------------------------

  @Get(':applicantId')
  @Permissions('workflow.view')
  @ApiOperation({ summary: "Get an applicant's current workflow state" })
  @ApiResponse({ status: 200, type: ApplicantWorkflowDto })
  @ApiResponse({ status: 404, description: 'Workflow not found for applicant' })
  async getApplicantWorkflow(
    @CurrentUser() user: JwtPayload,
    @Param('applicantId', ParseUUIDPipe) applicantId: string,
  ) {
    const data = await this.workflowService.getApplicantWorkflow(applicantId, user.organizationId);
    return { success: true, message: 'Applicant workflow retrieved', data };
  }

  @Patch(':applicantId')
  @Permissions('workflow.update')
  @ApiOperation({ summary: 'Move an applicant to a new workflow stage' })
  @ApiResponse({ status: 200, type: ApplicantWorkflowDto })
  @ApiResponse({ status: 400, description: 'Target stage deleted or invalid' })
  @ApiResponse({ status: 404, description: 'Workflow not found for applicant' })
  async changeStage(
    @CurrentUser() user: JwtPayload,
    @Param('applicantId', ParseUUIDPipe) applicantId: string,
    @Body() dto: UpdateApplicantWorkflowDto,
  ) {
    const data = await this.workflowService.changeStage(
      applicantId,
      user.organizationId,
      dto,
      user.sub,
    );
    return { success: true, message: 'Applicant workflow updated successfully', data };
  }

  @Get(':applicantId/history')
  @Permissions('workflow.view')
  @ApiOperation({ summary: "Get an applicant's immutable workflow transition history" })
  @ApiResponse({ status: 200, type: [WorkflowHistoryItemDto] })
  @ApiResponse({ status: 404, description: 'Workflow not found for applicant' })
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Param('applicantId', ParseUUIDPipe) applicantId: string,
  ) {
    const data = await this.workflowService.getHistory(applicantId, user.organizationId);
    return { success: true, message: 'Workflow history retrieved', data };
  }
}
