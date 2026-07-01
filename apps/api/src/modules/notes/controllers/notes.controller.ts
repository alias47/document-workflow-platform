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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApplicantNoteResponseDto } from '../dto/applicant-note-response.dto';
import { CreateApplicantNoteDto } from '../dto/create-applicant-note.dto';
import { UpdateApplicantNoteDto } from '../dto/update-applicant-note.dto';
import { NotesService } from '../services/notes.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Notes')
@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('applicants/:id/notes')
  @Permissions('notes.view')
  @ApiOperation({ summary: 'List all notes for an applicant' })
  @ApiResponse({ status: 200, type: [ApplicantNoteResponseDto] })
  async list(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) applicantId: string) {
    const data = await this.notesService.listByApplicant(applicantId, user.organizationId);
    return { success: true, message: 'Notes retrieved', data };
  }

  @Post('applicants/:id/notes')
  @Permissions('notes.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a note for an applicant' })
  @ApiResponse({ status: 201, type: ApplicantNoteResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) applicantId: string,
    @Body() dto: CreateApplicantNoteDto,
  ) {
    const data = await this.notesService.create(applicantId, user.organizationId, user.sub, dto);
    return { success: true, message: 'Note created', data };
  }

  @Patch('notes/:id')
  @Permissions('notes.update')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, type: ApplicantNoteResponseDto })
  @ApiResponse({ status: 403, description: 'Not the note author' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) noteId: string,
    @Body() dto: UpdateApplicantNoteDto,
  ) {
    const data = await this.notesService.update(noteId, user.organizationId, user.sub, dto);
    return { success: true, message: 'Note updated', data };
  }

  @Delete('notes/:id')
  @Permissions('notes.archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a note' })
  @ApiResponse({ status: 200, description: 'Note deleted' })
  @ApiResponse({ status: 403, description: 'Not the note author' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) noteId: string) {
    await this.notesService.remove(noteId, user.organizationId, user.sub);
    return { success: true, message: 'Note deleted', data: null };
  }
}
