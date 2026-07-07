import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
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

import { CreateDocumentDto } from '../dto/create-document.dto';
import { DocumentQueryDto } from '../dto/document-query.dto';
import {
  DocumentCreatedDto,
  DocumentDetailDto,
  DocumentListItemDto,
} from '../dto/document-response.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { DocumentUploadService } from '../services/document-upload.service';
import { DocumentService } from '../services/document.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import type { Response } from 'express';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly uploadService: DocumentUploadService,
  ) {}

  @Post('upload')
  @Permissions('document.create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    // Buffer in memory (no dest) so the service controls the storage path; the
    // hard byte cap is a defense-in-depth backstop — the service re-validates
    // against the configured max. 20 MiB ceiling here rejects oversized uploads
    // before they fully buffer.
    FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024, files: 1 } }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDocumentDto })
  @ApiOperation({ summary: 'Upload a document file and create its metadata record' })
  @ApiResponse({ status: 201, type: DocumentCreatedDto })
  @ApiResponse({ status: 400, description: 'Invalid or missing file' })
  @ApiResponse({ status: 404, description: 'Applicant not found' })
  async upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    const result = await this.uploadService.upload(file, dto, user.organizationId, {
      type: 'staff',
      staffId: user.sub,
    });
    return { success: true, message: 'Document uploaded successfully', data: result };
  }

  @Get(':id/download')
  @Permissions('document.view')
  @Header('Content-Disposition', 'attachment')
  @ApiOperation({ summary: 'Download a document file' })
  @ApiResponse({ status: 200, description: 'File stream' })
  @ApiResponse({ status: 404, description: 'Document or file not found' })
  async download(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, filename, contentType } = await this.uploadService.download(
      id,
      user.organizationId,
    );
    // Encode the filename to keep header injection out of Content-Disposition.
    const safeName = encodeURIComponent(filename);
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Type', contentType);
    return new StreamableFile(stream, { type: contentType });
  }

  @Delete(':id/file')
  @Permissions('document.archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete the physical file, retaining the metadata record' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteFile(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    await this.uploadService.deleteFile(id, user.organizationId, user.sub);
    return { success: true, message: 'Document file deleted successfully', data: null };
  }

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
