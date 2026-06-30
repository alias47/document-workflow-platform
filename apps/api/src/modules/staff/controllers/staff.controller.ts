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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateStaffDto } from '../dto/create-staff.dto';
import { StaffResponseDto } from '../dto/staff-response.dto';
import { UpdateStaffDto } from '../dto/update-staff.dto';
import { StaffService } from '../services/staff.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Staff')
@Controller('staff')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current staff profile' })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  async getMe(@CurrentUser() user: JwtPayload) {
    const staff = await this.staffService.getMe(user.sub);
    return { success: true, message: 'Profile retrieved', data: staff };
  }

  @Get()
  @Permissions('staff.view')
  @ApiOperation({ summary: 'List staff in organization' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, type: [StaffResponseDto] })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 25,
  ) {
    const result = await this.staffService.list(
      user.organizationId,
      Number(page),
      Number(pageSize),
    );
    return {
      success: true,
      message: 'Staff retrieved',
      data: result.data,
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    };
  }

  @Post()
  @Permissions('staff.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new staff member' })
  @ApiResponse({ status: 201, type: StaffResponseDto })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateStaffDto) {
    const staff = await this.staffService.create(dto, user.organizationId);
    return { success: true, message: 'Staff member created successfully', data: staff };
  }

  @Get(':id')
  @Permissions('staff.view')
  @ApiOperation({ summary: 'Get staff member by ID' })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async getById(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const staff = await this.staffService.getById(id, user.organizationId);
    return { success: true, message: 'Staff retrieved', data: staff };
  }

  @Patch(':id')
  @Permissions('staff.update')
  @ApiOperation({ summary: 'Update staff member' })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    const staff = await this.staffService.update(id, user.organizationId, dto);
    return { success: true, message: 'Staff updated successfully', data: staff };
  }

  @Delete(':id')
  @Permissions('staff.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete staff member' })
  @ApiResponse({ status: 200, description: 'Staff member deactivated' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async delete(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    await this.staffService.delete(id, user.organizationId);
    return { success: true, message: 'Staff member deactivated successfully', data: null };
  }
}
