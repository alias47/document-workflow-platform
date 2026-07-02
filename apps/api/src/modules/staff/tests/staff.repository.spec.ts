import { Test, type TestingModule } from '@nestjs/testing';

import { StaffRepository } from '../repositories/staff.repository';

import { PrismaService } from '@/prisma/prisma.service';

const ORG_ID = 'org-uuid-001';
const STAFF_ID = 'staff-uuid-001';

const prismaMock = {
  staff: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  applicant: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  applicantAssignment: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('StaffRepository', () => {
  let repo: StaffRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaffRepository, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    repo = module.get(StaffRepository);
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('queries by id and deletedAt null', async () => {
      prismaMock.staff.findFirst.mockResolvedValue(null);
      await repo.findById(STAFF_ID);
      expect(prismaMock.staff.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: STAFF_ID, deletedAt: null }),
        }),
      );
    });
  });

  describe('findByEmail', () => {
    it('queries by organizationId and email', async () => {
      prismaMock.staff.findFirst.mockResolvedValue(null);
      await repo.findByEmail(ORG_ID, 'test@example.com');
      expect(prismaMock.staff.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: ORG_ID, email: 'test@example.com' }),
        }),
      );
    });
  });

  describe('list', () => {
    it('returns data and total', async () => {
      prismaMock.staff.findMany.mockResolvedValue([]);
      prismaMock.staff.count.mockResolvedValue(0);
      const [data, total] = await repo.list(ORG_ID, {
        page: 1,
        pageSize: 25,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      expect(data).toEqual([]);
      expect(total).toBe(0);
    });

    it('applies search filter', async () => {
      prismaMock.staff.findMany.mockResolvedValue([]);
      prismaMock.staff.count.mockResolvedValue(0);
      await repo.list(ORG_ID, {
        page: 1,
        pageSize: 25,
        search: 'John',
        sortBy: 'firstName',
        sortOrder: 'asc',
      });
      const call = prismaMock.staff.findMany.mock.calls[0][0];
      expect(call.where.OR).toBeDefined();
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt and status inactive', async () => {
      prismaMock.staff.update.mockResolvedValue({});
      await repo.softDelete(STAFF_ID);
      expect(prismaMock.staff.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: STAFF_ID },
          data: expect.objectContaining({ status: 'inactive' }),
        }),
      );
    });
  });

  describe('replaceAssignments', () => {
    it('runs inside a transaction', async () => {
      prismaMock.$transaction.mockImplementation((fn: (tx: typeof prismaMock) => unknown) =>
        fn(prismaMock),
      );
      prismaMock.applicantAssignment.deleteMany.mockResolvedValue({ count: 0 });
      prismaMock.applicantAssignment.createMany.mockResolvedValue({ count: 2 });

      await repo.replaceAssignments(STAFF_ID, ORG_ID, ['a1', 'a2'], 'actor-id');

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.applicantAssignment.deleteMany).toHaveBeenCalledWith({
        where: { staffId: STAFF_ID, organizationId: ORG_ID },
      });
      expect(prismaMock.applicantAssignment.createMany).toHaveBeenCalled();
    });

    it('only deletes when applicantIds is empty', async () => {
      prismaMock.$transaction.mockImplementation((fn: (tx: typeof prismaMock) => unknown) =>
        fn(prismaMock),
      );
      prismaMock.applicantAssignment.deleteMany.mockResolvedValue({ count: 0 });

      await repo.replaceAssignments(STAFF_ID, ORG_ID, [], 'actor-id');

      expect(prismaMock.applicantAssignment.createMany).not.toHaveBeenCalled();
    });
  });
});
