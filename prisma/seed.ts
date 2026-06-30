import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Staff management
  { action: 'staff.view', description: 'View staff list and profiles' },
  { action: 'staff.create', description: 'Create new staff accounts' },
  { action: 'staff.update', description: 'Update staff profiles' },
  { action: 'staff.delete', description: 'Deactivate or delete staff' },
  // Applicants
  { action: 'applicant.view', description: 'View applicants' },
  { action: 'applicant.create', description: 'Create new applicants' },
  { action: 'applicant.update', description: 'Update applicant details' },
  { action: 'applicant.delete', description: 'Soft-delete applicants' },
  // Documents
  { action: 'document.view', description: 'View documents' },
  { action: 'document.upload', description: 'Upload documents' },
  { action: 'document.approve', description: 'Approve documents' },
  { action: 'document.reject', description: 'Reject documents' },
  { action: 'document.delete', description: 'Delete documents' },
  // Workflow
  { action: 'workflow.view', description: 'View workflow templates' },
  { action: 'workflow.manage', description: 'Create and edit workflow templates' },
  // Audit
  { action: 'audit.view', description: 'View audit logs' },
  // Settings
  { action: 'settings.manage', description: 'Manage organization settings' },
];

async function main(): Promise<void> {
  // --- Organization ---
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    create: {
      name: 'Default Organization',
      slug: 'default',
      contactEmail: 'admin@example.com',
      timezone: 'UTC',
    },
    update: {},
  });
  console.log(`Organization: ${org.name} (${org.id})`);

  // Persist org ID to .env.seed so scripts can reference it
  const orgId = org.id;

  // --- Permissions ---
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      create: perm,
      update: { description: perm.description },
    });
  }
  const allPerms = await prisma.permission.findMany();
  console.log(`Permissions: ${allPerms.length} seeded`);

  // --- Admin role (all permissions) ---
  const adminRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: orgId, name: 'Admin' } },
    create: {
      organizationId: orgId,
      name: 'Admin',
      description: 'Full system access',
      isDefault: false,
    },
    update: {},
  });

  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      create: { roleId: adminRole.id, permissionId: perm.id },
      update: {},
    });
  }
  console.log(`Role: Admin (${adminRole.id}) — ${allPerms.length} permissions`);

  // --- Consultant role (limited permissions) ---
  const consultantPerms = ['applicant.view', 'applicant.create', 'applicant.update',
    'document.view', 'document.upload', 'workflow.view'];
  const consultantRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: orgId, name: 'Consultant' } },
    create: {
      organizationId: orgId,
      name: 'Consultant',
      description: 'Manage own applicants and documents',
      isDefault: true,
    },
    update: {},
  });

  for (const action of consultantPerms) {
    const perm = allPerms.find((p) => p.action === action);
    if (!perm) continue;
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: consultantRole.id, permissionId: perm.id } },
      create: { roleId: consultantRole.id, permissionId: perm.id },
      update: {},
    });
  }
  console.log(`Role: Consultant (${consultantRole.id}) — ${consultantPerms.length} permissions`);

  // --- Admin staff user ---
  const adminPassword = process.env['SEED_ADMIN_PASSWORD'] ?? 'Admin@123456!';
  const passwordHash = await argon2.hash(adminPassword);

  const adminStaff = await prisma.staff.upsert({
    where: { organizationId_email: { organizationId: orgId, email: 'admin@example.com' } },
    create: {
      organizationId: orgId,
      roleId: adminRole.id,
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@example.com',
      passwordHash,
      status: 'active',
      mustChangePass: true,
    },
    update: {},
  });
  console.log(`Admin staff: ${adminStaff.email} (${adminStaff.id})`);

  // --- Sample applicants (with portal accounts + assignment to admin staff) ---
  const SAMPLE_APPLICANTS = [
    {
      applicantNumber: 'APP-2026-0001',
      firstName: 'Aarav',
      lastName: 'Sharma',
      gender: 'male',
      dateOfBirth: new Date('1999-04-12'),
      nationality: 'Nepali',
      email: 'aarav.sharma@example.com',
      phone: '+977-9800000001',
      city: 'Kathmandu',
      country: 'Nepal',
    },
    {
      applicantNumber: 'APP-2026-0002',
      firstName: 'Mei',
      middleName: 'Ling',
      lastName: 'Chen',
      gender: 'female',
      dateOfBirth: new Date('2001-09-30'),
      nationality: 'Chinese',
      email: 'mei.chen@example.com',
      phone: '+86-13800000002',
      city: 'Chengdu',
      country: 'China',
    },
    {
      applicantNumber: 'APP-2026-0003',
      firstName: 'Daniel',
      lastName: 'Okeke',
      gender: 'male',
      dateOfBirth: new Date('1997-01-22'),
      nationality: 'Nigerian',
      email: 'daniel.okeke@example.com',
      phone: '+234-8030000003',
      city: 'Lagos',
      country: 'Nigeria',
    },
  ];

  for (const data of SAMPLE_APPLICANTS) {
    const applicant = await prisma.applicant.upsert({
      where: { applicantNumber: data.applicantNumber },
      create: {
        organizationId: orgId,
        createdBy: adminStaff.id,
        status: 'active',
        ...data,
      },
      update: {},
    });

    // One portal account per applicant (pending invitation — staff-driven onboarding)
    await prisma.portalAccount.upsert({
      where: { applicantId: applicant.id },
      create: {
        organizationId: orgId,
        applicantId: applicant.id,
        email: data.email,
        status: 'pending',
        mustChangePass: true,
      },
      update: {},
    });

    // Primary assignment to the admin staff member
    const existingAssignment = await prisma.applicantAssignment.findFirst({
      where: { applicantId: applicant.id, staffId: adminStaff.id },
    });
    if (!existingAssignment) {
      await prisma.applicantAssignment.create({
        data: {
          organizationId: orgId,
          applicantId: applicant.id,
          staffId: adminStaff.id,
          assignedBy: adminStaff.id,
          isPrimary: true,
        },
      });
    }
  }
  console.log(`Applicants: ${SAMPLE_APPLICANTS.length} seeded (with portal accounts + assignments)`);

  console.log(`\nSeed complete.`);
  console.log(`DEFAULT_ORG_ID=${orgId}`);
  console.log(`Admin login: admin@example.com / ${adminPassword} (change on first login)`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
