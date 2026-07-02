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

import { AssignApplicantsDto } from '../dto/assign-applicants.dto';
import { CreateStaffDto } from '../dto/create-staff.dto';
import { StaffQueryDto } from '../dto/staff-query.dto';
import { StaffResponseDto } from '../dto/staff-response.dto';
import { UpdateStaffStatusDto } from '../dto/update-staff-status.dto';
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

  @Get('roles')
  @Permissions('staff.view')
  @ApiOperation({ summary: 'List roles available in organization' })
  async listRoles(@CurrentUser() user: JwtPayload) {
    const roles = await this.staffService.listRoles(user.organizationId);
    return { success: true, message: 'Roles retrieved', data: roles };
  }

  @Get()
  @Permissions('staff.view')
  @ApiOperation({ summary: 'List staff in organization' })
  @ApiResponse({ status: 200, type: [StaffResponseDto] })
  async list(@CurrentUser() user: JwtPayload, @Query() query: StaffQueryDto) {
    const result = await this.staffService.list(user.organizationId, query);
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
    const staff = await this.staffService.create(dto, user.organizationId, user.sub);
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
  @ApiOperation({ summary: 'Update staff member profile' })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    const staff = await this.staffService.update(id, user.organizationId, dto, user.sub);
    return { success: true, message: 'Staff updated successfully', data: staff };
  }

  @Patch(':id/status')
  @Permissions('staff.update')
  @ApiOperation({ summary: 'Activate or deactivate a staff member' })
  @ApiResponse({ status: 200, type: StaffResponseDto })
  @ApiResponse({ status: 403, description: 'Cannot deactivate yourself or last Super Admin' })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffStatusDto,
  ) {
    const staff = await this.staffService.updateStatus(id, user.organizationId, dto, user.sub);
    return { success: true, message: 'Staff status updated', data: staff };
  }

  @Delete(':id')
  @Permissions('staff.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete staff member' })
  @ApiResponse({ status: 200, description: 'Staff member deleted' })
  @ApiResponse({ status: 403, description: 'Cannot delete yourself or last Super Admin' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async delete(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    await this.staffService.delete(id, user.organizationId, user.sub);
    return { success: true, message: 'Staff member deleted successfully', data: null };
  }

  @Get(':id/applicants')
  @Permissions('staff.view')
  @ApiOperation({ summary: 'List applicants assigned to a staff member' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getApplicants(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 25,
  ) {
    const result = await this.staffService.getApplicants(
      id,
      user.organizationId,
      Number(page),
      Number(pageSize),
    );
    return {
      success: true,
      message: 'Assigned applicants retrieved',
      data: result.data,
      meta: {
        page: Number(page),
        pageSize: Number(pageSize),
        totalItems: result.total,
        totalPages: Math.ceil(result.total / Number(pageSize)),
      },
    };
  }

  @Patch(':id/applicants')
  @Permissions('staff.update')
  @ApiOperation({ summary: 'Atomically replace assigned applicants for a staff member' })
  @ApiResponse({ status: 200, description: 'Assignments updated' })
  async assignApplicants(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignApplicantsDto,
  ) {
    await this.staffService.assignApplicants(id, user.organizationId, dto, user.sub);
    return { success: true, message: 'Applicant assignments updated', data: null };
  }
}
