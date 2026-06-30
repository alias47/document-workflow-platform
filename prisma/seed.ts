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
