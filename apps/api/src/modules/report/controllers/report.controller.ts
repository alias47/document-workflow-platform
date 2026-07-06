import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import {
  ApplicantReportQueryDto,
  DocumentReportQueryDto,
  ExportQueryDto,
  StaffWorkloadQueryDto,
} from '../dto/report-query.dto';
import { ReportService } from '../services/report.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // --- Applicant Report ---

  @Get('applicants')
  @Permissions('report.view')
  @ApiOperation({ summary: 'Paginated applicant report with filters' })
  async getApplicantReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ApplicantReportQueryDto,
  ) {
    const result = await this.reportService.getApplicantReport(user.organizationId, {
      search: query.search,
      consultantId: query.consultantId,
      workflowStageId: query.workflowStageId,
      status: query.status,
      country: query.country,
      intake: query.intake,
      startDate: query.startDate,
      endDate: query.endDate,
      sort: query.sort,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });

    return { success: true, message: 'Applicant report retrieved', ...result };
  }

  @Get('applicants/export')
  @Permissions('report.export')
  @ApiOperation({ summary: 'Export applicant report' })
  async exportApplicantReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.reportService.exportApplicantReport(
      user.organizationId,
      {
        search: query.search,
        consultantId: query.consultantId,
        workflowStageId: query.workflowStageId,
        status: query.status,
        country: query.country,
        intake: query.intake,
        startDate: query.startDate,
        endDate: query.endDate,
        sort: query.sort,
      },
      query.format,
      user.sub,
    );

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length,
    });
    res.send(result.buffer);
  }

  // --- Document Report ---

  @Get('documents')
  @Permissions('report.view')
  @ApiOperation({ summary: 'Paginated document completion report' })
  async getDocumentReport(@CurrentUser() user: JwtPayload, @Query() query: DocumentReportQueryDto) {
    const result = await this.reportService.getDocumentReport(user.organizationId, {
      search: query.search,
      consultantId: query.consultantId,
      workflowStageId: query.workflowStageId,
      status: query.status,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });

    return { success: true, message: 'Document report retrieved', ...result };
  }

  @Get('documents/export')
  @Permissions('report.export')
  @ApiOperation({ summary: 'Export document report' })
  async exportDocumentReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.reportService.exportDocumentReport(
      user.organizationId,
      {
        search: query.search,
        consultantId: query.consultantId,
        workflowStageId: query.workflowStageId,
        status: query.status,
      },
      query.format,
      user.sub,
    );

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length,
    });
    res.send(result.buffer);
  }

  // --- Workflow Report ---

  @Get('workflow')
  @Permissions('report.view')
  @ApiOperation({ summary: 'Workflow stage distribution report' })
  async getWorkflowReport(@CurrentUser() user: JwtPayload) {
    const result = await this.reportService.getWorkflowReport(user.organizationId);
    return { success: true, message: 'Workflow report retrieved', ...result };
  }

  @Get('workflow/export')
  @Permissions('report.export')
  @ApiOperation({ summary: 'Export workflow report' })
  async exportWorkflowReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.reportService.exportWorkflowReport(
      user.organizationId,
      query.format,
      user.sub,
    );

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length,
    });
    res.send(result.buffer);
  }

  // --- Staff Workload Report ---

  @Get('staff-workload')
  @Permissions('report.view')
  @ApiOperation({ summary: 'Staff workload report' })
  async getStaffWorkloadReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: StaffWorkloadQueryDto,
  ) {
    const result = await this.reportService.getStaffWorkloadReport(user.organizationId, {
      search: query.search,
      roleId: query.roleId,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 25,
    });

    return { success: true, message: 'Staff workload report retrieved', ...result };
  }

  @Get('staff-workload/export')
  @Permissions('report.export')
  @ApiOperation({ summary: 'Export staff workload report' })
  async exportStaffWorkloadReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.reportService.exportStaffWorkloadReport(
      user.organizationId,
      { search: query.search, roleId: query.roleId },
      query.format,
      user.sub,
    );

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length,
    });
    res.send(result.buffer);
  }
}
