import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { NotesRepository } from '../repositories/notes.repository';
import { NotesService } from '../services/notes.service';

import type { CreateApplicantNoteDto } from '../dto/create-applicant-note.dto';
import type { UpdateApplicantNoteDto } from '../dto/update-applicant-note.dto';

import { AuditService } from '@/modules/audit/services/audit.service';

const ORG = 'org-1';
const APPLICANT = 'app-1';
const STAFF = 'staff-1';
const OTHER_STAFF = 'staff-2';
const NOTE_ID = 'note-1';

const mockNote = {
  id: NOTE_ID,
  organizationId: ORG,
  applicantId: APPLICANT,
  authorId: STAFF,
  content: 'Hello',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: STAFF,
  updatedBy: null,
  deletedBy: null,
  author: { id: STAFF, firstName: 'Jane', lastName: 'Smith' },
};

describe('NotesService', () => {
  let service: NotesService;
  let repo: jest.Mocked<NotesRepository>;
  let audit: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: NotesRepository,
          useValue: {
            listByApplicant: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get(NotesService);
    repo = module.get(NotesRepository);
    audit = module.get(AuditService);
  });

  describe('listByApplicant', () => {
    it('returns repository result', async () => {
      repo.listByApplicant.mockResolvedValue([mockNote]);
      const result = await service.listByApplicant(APPLICANT, ORG);
      expect(result).toHaveLength(1);
      expect(repo.listByApplicant).toHaveBeenCalledWith(APPLICANT, ORG);
    });
  });

  describe('create', () => {
    it('creates note and logs audit', async () => {
      repo.create.mockResolvedValue(mockNote);
      const dto: CreateApplicantNoteDto = { content: 'Hello' };
      const result = await service.create(APPLICANT, ORG, STAFF, dto);
      expect(result.id).toBe(NOTE_ID);
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'note.created' }));
    });
  });

  describe('update', () => {
    it('throws NotFoundException when note not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(
        service.update(NOTE_ID, ORG, STAFF, { content: 'x' } as UpdateApplicantNoteDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not the author', async () => {
      repo.findById.mockResolvedValue(mockNote);
      await expect(
        service.update(NOTE_ID, ORG, OTHER_STAFF, { content: 'x' } as UpdateApplicantNoteDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates and logs audit when author', async () => {
      repo.findById.mockResolvedValue(mockNote);
      repo.update.mockResolvedValue({ ...mockNote, content: 'Updated' });
      const result = await service.update(NOTE_ID, ORG, STAFF, {
        content: 'Updated',
      } as UpdateApplicantNoteDto);
      expect(result.content).toBe('Updated');
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'note.updated' }));
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when note not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove(NOTE_ID, ORG, STAFF)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not the author', async () => {
      repo.findById.mockResolvedValue(mockNote);
      await expect(service.remove(NOTE_ID, ORG, OTHER_STAFF)).rejects.toThrow(ForbiddenException);
    });

    it('soft deletes and logs audit when author', async () => {
      repo.findById.mockResolvedValue(mockNote);
      repo.softDelete.mockResolvedValue({ ...mockNote, deletedAt: new Date() });
      await service.remove(NOTE_ID, ORG, STAFF);
      expect(repo.softDelete).toHaveBeenCalledWith(NOTE_ID, STAFF);
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'note.deleted' }));
    });
  });
});
