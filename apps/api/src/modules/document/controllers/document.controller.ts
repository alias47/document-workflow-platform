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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateDocumentDto } from '../dto/create-document.dto';
import { DocumentQueryDto } from '../dto/document-query.dto';
import {
  DocumentCreatedDto,
  DocumentDetailDto,
  DocumentListItemDto,
} from '../dto/document-response.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { DocumentService } from '../services/document.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @Permissions('document.view')
  @ApiOperation({ summary: 'List documents with pagination and filtering' })
  @ApiResponse({ status: 200, type: [DocumentListItemDto] })
  async list(@CurrentUser() user: JwtPayload, @Query() query: DocumentQueryDto) {
    const result = await this.documentService.list(user.organizationId, query);
    return { success: true, message: 'Documents retrieved', ...result };
  }

  @Get(':id')
  @Permissions('document.view')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, type: DocumentDetailDto })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getById(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const document = await this.documentService.getById(id, user.organizationId);
    return { success: true, message: 'Document retrieved', data: document };
  }

  @Post()
  @Permissions('document.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a document metadata record' })
  @ApiResponse({ status: 201, type: DocumentCreatedDto })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateDocumentDto) {
    const result = await this.documentService.create(dto, user.organizationId, user.sub);
    return { success: true, message: 'Document created successfully', data: result };
  }

  @Patch(':id')
  @Permissions('document.update')
  @ApiOperation({ summary: 'Update document metadata or verification status' })
  @ApiResponse({ status: 200, type: DocumentDetailDto })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    const updated = await this.documentService.update(id, user.organizationId, dto, user.sub);
    return { success: true, message: 'Document updated successfully', data: updated };
  }

  @Delete(':id')
  @Permissions('document.archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive document (soft delete)' })
  @ApiResponse({ status: 200, description: 'Document archived' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async archive(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    await this.documentService.archive(id, user.organizationId, user.sub);
    return { success: true, message: 'Document archived successfully', data: null };
  }
}
