import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SettingsResponseDto } from '../dto/settings-response.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { SystemSettingsService } from '../services/system-settings.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get system settings (Super Admin only)' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async getSettings(@CurrentUser() user: JwtPayload) {
    const settings = await this.settingsService.getSettings(user.organizationId);
    return { success: true, message: 'Settings retrieved', data: settings };
  }

  @Patch()
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update system settings (Super Admin only)' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async updateSettings(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSettingsDto) {
    const settings = await this.settingsService.updateSettings(user.organizationId, dto, user.sub);
    return { success: true, message: 'Settings updated', data: settings };
  }

  @Patch('logo')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('logo', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { logo: { type: 'string', format: 'binary' } },
      required: ['logo'],
    },
  })
  @ApiOperation({ summary: 'Upload or replace the consultancy logo (Super Admin only)' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async uploadLogo(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    const settings = await this.settingsService.uploadLogo(user.organizationId, file, user.sub);
    return { success: true, message: 'Logo uploaded', data: settings };
  }

  @Delete('logo')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove the consultancy logo (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Logo removed' })
  async removeLogo(@CurrentUser() user: JwtPayload) {
    const settings = await this.settingsService.removeLogo(user.organizationId, user.sub);
    return { success: true, message: 'Logo removed', data: settings };
  }
}
