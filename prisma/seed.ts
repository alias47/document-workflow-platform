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
  { action: 'applicant.archive', description: 'Archive (soft-delete) applicants' },
  // Documents
  { action: 'document.view', description: 'View documents' },
  { action: 'document.create', description: 'Create document records' },
  { action: 'document.update', description: 'Update document details' },
  { action: 'document.archive', description: 'Archive (soft-delete) documents' },
  // Workflow
  { action: 'workflow.view', description: 'View workflow stages and applicant workflow state' },
  { action: 'workflow.create', description: 'Create workflow stages' },
  {
    action: 'workflow.update',
    description: 'Update workflow stages and move applicants between stages',
  },
  { action: 'workflow.archive', description: 'Archive (soft-delete) workflow stages' },
  // Notes
  { action: 'notes.view', description: 'View applicant notes' },
  { action: 'notes.create', description: 'Create applicant notes' },
  { action: 'notes.update', description: 'Edit applicant notes' },
  { action: 'notes.archive', description: 'Delete (soft-delete) applicant notes' },
  // Search
  { action: 'search.view', description: 'Use the global search feature' },
  // Dashboard
  { action: 'dashboard.view', description: 'View the aggregated dashboard' },
  {
    action: 'dashboard.workload.view',
    description: 'View the staff workload widget (managers/administrators only)',
  },
  // Reports
  { action: 'report.view', description: 'View reporting dashboards' },
  { action: 'report.export', description: 'Export reports (CSV/Excel/PDF)' },
  // Notifications
  { action: 'notification.view', description: 'View notification delivery history' },
  { action: 'notification.manage', description: 'Retry failed notifications' },
  // Audit
  { action: 'audit.view', description: 'View audit logs' },
  // Settings
  { action: 'settings.manage', description: 'Manage organization settings' },
];

// Default workflow stages (TASK 8.1). The first stage (New Inquiry) is the
// default assigned to newly created applicants; the last (Closed) is terminal.
const WORKFLOW_STAGES = [
  { name: 'New Inquiry', color: '#6B7280', icon: 'inbox', isDefault: true, isFinal: false },
  { name: 'Documents Pending', color: '#F59E0B', icon: 'folder', isDefault: false, isFinal: false },
  {
    name: 'Documents Verified',
    color: '#3B82F6',
    icon: 'badge-check',
    isDefault: false,
    isFinal: false,
  },
  { name: 'Offer Issued', color: '#8B5CF6', icon: 'mail', isDefault: false, isFinal: false },
  {
    name: 'Offer Accepted',
    color: '#10B981',
    icon: 'check-circle',
    isDefault: false,
    isFinal: false,
  },
  { name: 'Visa Processing', color: '#0EA5E9', icon: 'plane', isDefault: false, isFinal: false },
  { name: 'Visa Approved', color: '#22C55E', icon: 'stamp', isDefault: false, isFinal: false },
  { name: 'Enrolled', color: '#16A34A', icon: 'graduation-cap', isDefault: false, isFinal: false },
  { name: 'Closed', color: '#4B5563', icon: 'archive', isDefault: false, isFinal: true },
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
    'document.view', 'document.create', 'document.update',
    'workflow.view', 'workflow.update',
    'notes.view', 'notes.create', 'notes.update', 'notes.archive',
    'search.view', 'dashboard.view'];
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

  // --- Workflow stages ---
  let defaultStageId: string | null = null;
  for (const [index, stage] of WORKFLOW_STAGES.entries()) {
    const existing = await prisma.workflowStage.findFirst({
      where: { organizationId: orgId, name: stage.name, deletedAt: null },
    });
    const record = existing
      ? await prisma.workflowStage.update({
          where: { id: existing.id },
          data: {
            color: stage.color,
            icon: stage.icon,
            order: index,
            isDefault: stage.isDefault,
            isFinal: stage.isFinal,
          },
        })
      : await prisma.workflowStage.create({
          data: {
            organizationId: orgId,
            name: stage.name,
            color: stage.color,
            icon: stage.icon,
            order: index,
            isDefault: stage.isDefault,
            isFinal: stage.isFinal,
          },
        });
    if (stage.isDefault) defaultStageId = record.id;
  }
  console.log(`Workflow stages: ${WORKFLOW_STAGES.length} seeded (default: New Inquiry)`);

  // --- Admin staff user ---
  const adminPassword = process.env['SEED_ADMIN_PASSWORD'] ?? 'NewPass@1234!';
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

    // Default workflow position for the applicant (mirrors the runtime rule of
    // auto-assigning the default stage on applicant creation).
    if (defaultStageId) {
      const existingWorkflow = await prisma.applicantWorkflow.findUnique({
        where: { applicantId: applicant.id },
      });
      if (!existingWorkflow) {
        await prisma.applicantWorkflow.create({
          data: {
            organizationId: orgId,
            applicantId: applicant.id,
            currentStageId: defaultStageId,
            createdBy: adminStaff.id,
          },
        });
        await prisma.workflowHistory.create({
          data: {
            organizationId: orgId,
            applicantId: applicant.id,
            fromStageId: null,
            toStageId: defaultStageId,
            changedBy: adminStaff.id,
            comment: 'Workflow initialized',
          },
        });
      }
    }

    // Seed a baseline activity entry (TASK 8.4). Activity is append-only and
    // normally system-generated; this gives the Activity Log tab data to show.
    const existingActivity = await prisma.applicantActivity.findFirst({
      where: { applicantId: applicant.id, type: 'system.created' },
    });
    if (!existingActivity) {
      await prisma.applicantActivity.create({
        data: {
          organizationId: orgId,
          applicantId: applicant.id,
          actorId: adminStaff.id,
          type: 'system.created',
          title: 'Applicant record created',
          description: 'Seeded during initial setup',
        },
      });
    }

    // Sample document metadata record (upload comes in a later sprint —
    // storageKey/storedFilename are placeholders, no physical file exists yet).
    const existingDocument = await prisma.document.findFirst({
      where: { applicantId: applicant.id, storageKey: `seed/${applicant.id}/passport.pdf` },
    });
    if (!existingDocument) {
      await prisma.document.create({
        data: {
          organizationId: orgId,
          applicantId: applicant.id,
          uploadedBy: adminStaff.id,
          category: 'identity',
          status: 'pending',
          title: 'Passport',
          description: 'Applicant passport document',
          tags: ['identity', 'passport'],
          originalFilename: 'passport.pdf',
          storedFilename: `${applicant.id}-passport.pdf`,
          mimeType: 'application/pdf',
          fileSize: 204_800,
          storageKey: `seed/${applicant.id}/passport.pdf`,
          createdBy: adminStaff.id,
        },
      });
    }
  }
  console.log(`Applicants: ${SAMPLE_APPLICANTS.length} seeded (with portal accounts + assignments + documents)`);

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
