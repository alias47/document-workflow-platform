import {
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { NotificationQueryDto } from '../dto/notification-query.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { NotificationService } from '../services/notification.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Permissions('notification.view')
  @ApiOperation({ summary: 'List notification history' })
  @ApiResponse({ status: 200, type: [NotificationResponseDto] })
  async list(@CurrentUser() user: JwtPayload, @Query() query: NotificationQueryDto) {
    const result = await this.notificationService.list(user.organizationId, query);
    return { success: true, message: 'Notifications retrieved', ...result };
  }

  @Get(':id')
  @Permissions('notification.view')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getById(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const notification = await this.notificationService.getById(id, user.organizationId);
    return { success: true, message: 'Notification retrieved', data: notification };
  }

  @Post(':id/retry')
  @Permissions('notification.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed notification' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 409, description: 'Already sent or max retries reached' })
  async retry(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const notification = await this.notificationService.retry(id, user.organizationId, user.sub);
    return { success: true, message: 'Notification queued for retry', data: notification };
  }
}
