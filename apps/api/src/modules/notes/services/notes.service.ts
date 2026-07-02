import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { NotesRepository } from '../repositories/notes.repository';

import type { CreateApplicantNoteDto } from '../dto/create-applicant-note.dto';
import type { UpdateApplicantNoteDto } from '../dto/update-applicant-note.dto';

import { ACTIVITY_TYPES } from '@/modules/activity/interfaces/activity-type';
import { ActivityService } from '@/modules/activity/services/activity.service';
import { AuditService } from '@/modules/audit/services/audit.service';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepo: NotesRepository,
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
  ) {}

  async listByApplicant(applicantId: string, organizationId: string) {
    return this.notesRepo.listByApplicant(applicantId, organizationId);
  }

  async create(
    applicantId: string,
    organizationId: string,
    staffId: string,
    dto: CreateApplicantNoteDto,
  ) {
    const note = await this.notesRepo.create({
      organizationId,
      applicantId,
      authorId: staffId,
      content: dto.content,
      createdBy: staffId,
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      action: 'note.created',
      resourceType: 'ApplicantNote',
      resourceId: note.id,
      metadata: { applicantId },
    });

    void this.activityService.record({
      organizationId,
      applicantId,
      actorId: staffId,
      type: ACTIVITY_TYPES.NOTE_CREATED,
      title: 'Note added',
      metadata: { noteId: note.id },
    });

    return note;
  }

  async update(
    noteId: string,
    organizationId: string,
    staffId: string,
    dto: UpdateApplicantNoteDto,
  ) {
    const existing = await this.notesRepo.findById(noteId, organizationId);
    if (!existing) throw new NotFoundException('Note not found');

    // Only the author may edit their own note
    if (existing.authorId !== staffId) {
      throw new ForbiddenException('You can only edit your own notes');
    }

    const updated = await this.notesRepo.update(noteId, {
      content: dto.content,
      updatedBy: staffId,
    });

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      action: 'note.updated',
      resourceType: 'ApplicantNote',
      resourceId: noteId,
    });

    void this.activityService.record({
      organizationId,
      applicantId: existing.applicantId,
      actorId: staffId,
      type: ACTIVITY_TYPES.NOTE_UPDATED,
      title: 'Note updated',
      metadata: { noteId },
    });

    return updated;
  }

  async remove(noteId: string, organizationId: string, staffId: string) {
    const existing = await this.notesRepo.findById(noteId, organizationId);
    if (!existing) throw new NotFoundException('Note not found');

    // Only the author may delete their own note
    if (existing.authorId !== staffId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.notesRepo.softDelete(noteId, staffId);

    void this.auditService.log({
      organizationId,
      actorId: staffId,
      action: 'note.deleted',
      resourceType: 'ApplicantNote',
      resourceId: noteId,
    });

    void this.activityService.record({
      organizationId,
      applicantId: existing.applicantId,
      actorId: staffId,
      type: ACTIVITY_TYPES.NOTE_DELETED,
      title: 'Note deleted',
      metadata: { noteId },
    });
  }
}
