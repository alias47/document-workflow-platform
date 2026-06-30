import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { OrganizationService } from '../services/organization.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Organization')
@Controller('organization')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'Get organization profile' })
  async getOrganization(@CurrentUser() user: JwtPayload) {
    const org = await this.orgService.getById(user.organizationId);
    return { success: true, message: 'Organization retrieved', data: org };
  }

  @Patch()
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Update organization profile' })
  async updateOrganization(@CurrentUser() user: JwtPayload, @Body() dto: UpdateOrganizationDto) {
    const org = await this.orgService.update(user.organizationId, dto);
    return { success: true, message: 'Organization updated', data: org };
  }
}
