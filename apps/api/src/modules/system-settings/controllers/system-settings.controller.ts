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
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @Permissions('settings.manage')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async getSettings(@CurrentUser() user: JwtPayload) {
    const settings = await this.settingsService.getSettings(user.organizationId);
    return { success: true, message: 'Settings retrieved', data: settings };
  }

  @Patch()
  @Permissions('settings.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async updateSettings(@CurrentUser() user: JwtPayload, @Body() dto: UpdateSettingsDto) {
    const settings = await this.settingsService.updateSettings(user.organizationId, dto, user.sub);
    return { success: true, message: 'Settings updated', data: settings };
  }

  @Patch('logo')
  @Permissions('settings.manage')
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
  @ApiOperation({ summary: 'Upload or replace the consultancy logo' })
  @ApiResponse({ status: 200, type: SettingsResponseDto })
  async uploadLogo(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    const settings = await this.settingsService.uploadLogo(user.organizationId, file, user.sub);
    return { success: true, message: 'Logo uploaded', data: settings };
  }

  @Delete('logo')
  @Permissions('settings.manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove the consultancy logo' })
  @ApiResponse({ status: 200, description: 'Logo removed' })
  async removeLogo(@CurrentUser() user: JwtPayload) {
    const settings = await this.settingsService.removeLogo(user.organizationId, user.sub);
    return { success: true, message: 'Logo removed', data: settings };
  }
}
