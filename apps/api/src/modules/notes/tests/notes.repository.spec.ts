import { Test, type TestingModule } from '@nestjs/testing';

import { NotesRepository } from '../repositories/notes.repository';

import { PrismaService } from '@/prisma/prisma.service';

const ORG = 'org-uuid-1';
const APPLICANT = 'app-uuid-1';
const STAFF = 'staff-uuid-1';
const NOTE_ID = 'note-uuid-1';

const mockNote = {
  id: NOTE_ID,
  organizationId: ORG,
  applicantId: APPLICANT,
  authorId: STAFF,
  content: 'Test note',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: STAFF,
  updatedBy: null,
  deletedBy: null,
  author: { id: STAFF, firstName: 'Jane', lastName: 'Smith' },
};

describe('NotesRepository', () => {
  let repo: NotesRepository;
  let prisma: {
    applicantNote: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      applicantNote: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotesRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repo = module.get(NotesRepository);
  });

  describe('listByApplicant', () => {
    it('returns notes ordered by createdAt desc', async () => {
      prisma.applicantNote.findMany.mockResolvedValue([mockNote]);
      const result = await repo.listByApplicant(APPLICANT, ORG);
      expect(result).toHaveLength(1);
      expect(prisma.applicantNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { applicantId: APPLICANT, organizationId: ORG, deletedAt: null },
        }),
      );
    });
  });

  describe('findById', () => {
    it('returns note when found', async () => {
      prisma.applicantNote.findFirst.mockResolvedValue(mockNote);
      const result = await repo.findById(NOTE_ID, ORG);
      expect(result?.id).toBe(NOTE_ID);
    });

    it('returns null when not found', async () => {
      prisma.applicantNote.findFirst.mockResolvedValue(null);
      const result = await repo.findById('missing', ORG);
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and returns note with author', async () => {
      prisma.applicantNote.create.mockResolvedValue(mockNote);
      const result = await repo.create({
        organizationId: ORG,
        applicantId: APPLICANT,
        authorId: STAFF,
        content: 'Test note',
        createdBy: STAFF,
      });
      expect(result.author).toBeDefined();
      expect(result.content).toBe('Test note');
    });
  });

  describe('update', () => {
    it('updates content and sets updatedBy', async () => {
      const updated = { ...mockNote, content: 'Updated', updatedBy: STAFF };
      prisma.applicantNote.update.mockResolvedValue(updated);
      const result = await repo.update(NOTE_ID, { content: 'Updated', updatedBy: STAFF });
      expect(result.content).toBe('Updated');
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt and deletedBy', async () => {
      prisma.applicantNote.update.mockResolvedValue({
        ...mockNote,
        deletedAt: new Date(),
        deletedBy: STAFF,
      });
      await repo.softDelete(NOTE_ID, STAFF);
      expect(prisma.applicantNote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: NOTE_ID },
          data: expect.objectContaining({ deletedBy: STAFF }),
        }),
      );
    });
  });
});
