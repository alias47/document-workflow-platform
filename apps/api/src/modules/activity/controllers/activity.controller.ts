import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ActivityQueryDto } from '../dto/activity-query.dto';
import { ActivityResponseDto } from '../dto/activity-response.dto';
import { ActivityService } from '../services/activity.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Activity')
@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('applicants/:id/activity')
  @Permissions('applicant.view')
  @ApiOperation({ summary: 'List an applicant activity log (newest first)' })
  @ApiResponse({ status: 200, type: [ActivityResponseDto] })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) applicantId: string,
    @Query() query: ActivityQueryDto,
  ) {
    const result = await this.activityService.listByApplicant(
      applicantId,
      user.organizationId,
      query,
    );
    return { success: true, message: 'Activity retrieved', ...result };
  }
}
