import { Test, type TestingModule } from '@nestjs/testing';

import { NotesController } from '../controllers/notes.controller';
import { NotesService } from '../services/notes.service';

import type { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

const ORG = 'org-1';
const APPLICANT = 'app-1';
const STAFF = 'staff-1';
const NOTE_ID = 'note-1';

const jwtUser: JwtPayload = {
  sub: STAFF,
  email: 'jane@example.com',
  organizationId: ORG,
  role: 'consultant',
  permissions: ['notes.view', 'notes.create', 'notes.update', 'notes.archive'],
};

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

describe('NotesController', () => {
  let controller: NotesController;
  let service: jest.Mocked<NotesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: {
            listByApplicant: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/common/guards/permissions.guard').PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(NotesController);
    service = module.get(NotesService);
  });

  describe('list', () => {
    it('returns notes envelope', async () => {
      service.listByApplicant.mockResolvedValue([mockNote]);
      const result = await controller.list(jwtUser, APPLICANT);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('returns 201 envelope', async () => {
      service.create.mockResolvedValue(mockNote);
      const result = await controller.create(jwtUser, APPLICANT, { content: 'Hello' });
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(NOTE_ID);
    });
  });

  describe('update', () => {
    it('returns updated note envelope', async () => {
      service.update.mockResolvedValue({ ...mockNote, content: 'Updated' });
      const result = await controller.update(jwtUser, NOTE_ID, { content: 'Updated' });
      expect(result.data.content).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('returns delete envelope', async () => {
      service.remove.mockResolvedValue(undefined);
      const result = await controller.remove(jwtUser, NOTE_ID);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });
});
