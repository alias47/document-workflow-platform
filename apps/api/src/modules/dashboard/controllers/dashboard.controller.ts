import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DashboardActivityDto } from '../dto/dashboard-activity.dto';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';
import { DashboardSummaryDto } from '../dto/dashboard-summary.dto';
import { StaffWorkloadItemDto } from '../dto/dashboard-workload.dto';
import { DashboardService } from '../services/dashboard.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Permissions('dashboard.view')
  @ApiOperation({ summary: 'Get the aggregated dashboard for the current organization' })
  @ApiResponse({ status: 200, type: DashboardResponseDto })
  async getDashboard(@CurrentUser() user: JwtPayload) {
    const data = await this.dashboardService.getDashboard(user.organizationId);
    return { success: true, message: 'Dashboard retrieved', data };
  }

  @Get('summary')
  @Permissions('dashboard.view')
  @ApiOperation({ summary: 'KPI cards, applicant status, document completion, workflow summary' })
  @ApiResponse({ status: 200, type: DashboardSummaryDto })
  async getSummary(@CurrentUser() user: JwtPayload) {
    const data = await this.dashboardService.getSummary(user.organizationId);
    return { success: true, message: 'Dashboard summary retrieved', data };
  }

  @Get('activity')
  @Permissions('dashboard.view')
  @ApiOperation({ summary: 'Latest 20 organization activities (newest first)' })
  @ApiResponse({ status: 200, type: [DashboardActivityDto] })
  async getActivity(@CurrentUser() user: JwtPayload) {
    const data = await this.dashboardService.getActivity(user.organizationId);
    return { success: true, message: 'Recent activity retrieved', data };
  }

  @Get('workload')
  @Permissions('dashboard.workload.view')
  @ApiOperation({ summary: 'Per-staff workload (managers/administrators only)' })
  @ApiResponse({ status: 200, type: [StaffWorkloadItemDto] })
  @ApiResponse({ status: 403, description: 'Requires dashboard.workload.view' })
  async getWorkload(@CurrentUser() user: JwtPayload) {
    const data = await this.dashboardService.getWorkload(user.organizationId);
    return { success: true, message: 'Staff workload retrieved', data };
  }
}
