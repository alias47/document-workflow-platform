/**
 * Test seed helpers.
 *
 * Each helper inserts a minimal, isolated set of rows into the real database and
 * returns the IDs it created so callers can reference them in assertions and clean up.
 * All IDs are generated with randomUUID() so concurrent test workers don't collide.
 *
 * Cleanup is the caller's responsibility — use the companion teardown helpers
 * or call rawDeleteOrg(orgId) to cascade-delete everything under an org.
 */

import { randomUUID } from 'crypto';

import argon2 from 'argon2';

import { rawPrisma } from './db';

export interface SeedOrg {
  orgId: string;
  roleId: string;
  adminRoleId: string;
  staffId: string;
  staffEmail: string;
  staffPassword: string;
}

export interface SeedApplicant {
  applicantId: string;
  portalAccountId: string;
  portalEmail: string;
  portalPassword: string;
}

export interface SeedDocument {
  documentId: string;
  requirementId: string;
  applicantReqId: string;
}

/**
 * Seed a self-contained organization with an Admin role (all permissions),
 * a Consultant role, and a single admin staff user.
 *
 * Returns all IDs needed to authenticate and make assertions.
 */
export async function seedOrg(): Promise<SeedOrg> {
  const orgId = randomUUID();
  const slug = `test-${orgId.slice(0, 8)}`;
  const staffEmail = `admin-${orgId.slice(0, 8)}@test.example`;
  const staffPassword = 'TestPass@123!';
  const passwordHash = await argon2.hash(staffPassword);

  // Organization
  await rawPrisma.organization.create({
    data: {
      id: orgId,
      name: `Test Org ${orgId.slice(0, 8)}`,
      slug,
      contactEmail: staffEmail,
      isActive: true,
    },
  });

  // Permissions — upsert so they survive across test runs (they're global)
  const permActions = [
    'applicant.view',
    'applicant.create',
    'applicant.update',
    'applicant.archive',
    'document.view',
    'document.create',
    'document.update',
    'document.archive',
    'workflow.view',
    'workflow.create',
    'workflow.update',
    'workflow.archive',
    'notes.view',
    'notes.create',
    'notes.update',
    'notes.archive',
    'staff.view',
    'staff.create',
    'staff.update',
    'staff.delete',
    'search.view',
    'dashboard.view',
    'dashboard.workload.view',
    'report.view',
    'report.export',
    'notification.view',
    'notification.manage',
    'audit.view',
    'settings.manage',
  ];
  for (const action of permActions) {
    await rawPrisma.permission.upsert({
      where: { action },
      create: { action },
      update: {},
    });
  }
  const allPerms = await rawPrisma.permission.findMany({
    where: { action: { in: permActions } },
  });

  // Admin role with all permissions
  const adminRole = await rawPrisma.role.create({
    data: {
      id: randomUUID(),
      organizationId: orgId,
      name: 'Admin',
    },
  });
  for (const perm of allPerms) {
    await rawPrisma.rolePermission.create({
      data: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Consultant role (limited subset)
  const consultantPerms = allPerms.filter((p) =>
    [
      'applicant.view',
      'applicant.create',
      'document.view',
      'document.create',
      'search.view',
      'dashboard.view',
      'workflow.view',
    ].includes(p.action),
  );
  const consultantRole = await rawPrisma.role.create({
    data: {
      id: randomUUID(),
      organizationId: orgId,
      name: 'Consultant',
      isDefault: true,
    },
  });
  for (const perm of consultantPerms) {
    await rawPrisma.rolePermission.create({
      data: { roleId: consultantRole.id, permissionId: perm.id },
    });
  }

  // Admin staff user
  const staffId = randomUUID();
  await rawPrisma.staff.create({
    data: {
      id: staffId,
      organizationId: orgId,
      roleId: adminRole.id,
      firstName: 'Test',
      lastName: 'Admin',
      email: staffEmail,
      passwordHash,
      status: 'active',
      mustChangePass: false,
    },
  });

  // Default workflow stage (required for applicant creation)
  await rawPrisma.workflowStage.create({
    data: {
      id: randomUUID(),
      organizationId: orgId,
      name: 'New Inquiry',
      color: '#6B7280',
      order: 0,
      isDefault: true,
      isFinal: false,
    },
  });

  return {
    orgId,
    roleId: consultantRole.id,
    adminRoleId: adminRole.id,
    staffId,
    staffEmail,
    staffPassword,
  };
}

/**
 * Add a second consultant-role staff member to an existing seeded org.
 */
export async function seedConsultantStaff(orgId: string, consultantRoleId: string) {
  const staffPassword = 'TestPass@123!';
  const passwordHash = await argon2.hash(staffPassword);
  const staffEmail = `consultant-${randomUUID().slice(0, 8)}@test.example`;
  const staffId = randomUUID();

  await rawPrisma.staff.create({
    data: {
      id: staffId,
      organizationId: orgId,
      roleId: consultantRoleId,
      firstName: 'Test',
      lastName: 'Consultant',
      email: staffEmail,
      passwordHash,
      status: 'active',
      mustChangePass: false,
    },
  });

  return { staffId, staffEmail, staffPassword };
}

/**
 * Add an applicant with a portal account to an existing seeded org.
 * Returns IDs and the portal credentials for applicant-auth tests.
 */
export async function seedApplicant(orgId: string, staffId: string): Promise<SeedApplicant> {
  const applicantId = randomUUID();
  const portalAccountId = randomUUID();
  const suffix = applicantId.slice(0, 8);
  const portalEmail = `applicant-${suffix}@test.example`;
  const portalPassword = 'PortalPass@123!';
  const passwordHash = await argon2.hash(portalPassword);

  await rawPrisma.applicant.create({
    data: {
      id: applicantId,
      organizationId: orgId,
      applicantNumber: `TEST-${suffix}`,
      firstName: 'Test',
      lastName: 'Applicant',
      status: 'active',
      createdBy: staffId,
    },
  });

  await rawPrisma.portalAccount.create({
    data: {
      id: portalAccountId,
      organizationId: orgId,
      applicantId,
      email: portalEmail,
      passwordHash,
      status: 'active',
      mustChangePass: false,
      activatedAt: new Date(),
    },
  });

  // Primary assignment
  await rawPrisma.applicantAssignment.create({
    data: {
      organizationId: orgId,
      applicantId,
      staffId,
      assignedBy: staffId,
      isPrimary: true,
    },
  });

  // Workflow record
  const defaultStage = await rawPrisma.workflowStage.findFirst({
    where: { organizationId: orgId, isDefault: true, deletedAt: null },
  });
  if (defaultStage) {
    await rawPrisma.applicantWorkflow.create({
      data: {
        organizationId: orgId,
        applicantId,
        currentStageId: defaultStage.id,
        createdBy: staffId,
      },
    });
  }

  return { applicantId, portalAccountId, portalEmail, portalPassword };
}

/**
 * Add a document requirement and an applicant requirement for a specific applicant.
 */
export async function seedDocumentRequirement(
  orgId: string,
  applicantId: string,
): Promise<SeedDocument> {
  const requirementId = randomUUID();
  const applicantReqId = randomUUID();
  const documentId = randomUUID();

  await rawPrisma.documentRequirement.create({
    data: {
      id: requirementId,
      organizationId: orgId,
      name: `Test Req ${requirementId.slice(0, 6)}`,
      category: 'identity',
      isRequired: true,
      isActive: true,
      sortOrder: 1,
    },
  });

  await rawPrisma.applicantDocumentRequirement.create({
    data: {
      id: applicantReqId,
      applicantId,
      requirementId,
      status: 'pending',
      assignedAt: new Date(),
    },
  });

  // Pending document record (no physical file in tests)
  await rawPrisma.document.create({
    data: {
      id: documentId,
      organizationId: orgId,
      applicantId,
      category: 'identity',
      status: 'pending',
      originalFilename: 'test-passport.pdf',
      storedFilename: `${documentId}-test-passport.pdf`,
      mimeType: 'application/pdf',
      fileSize: 1024,
      storageKey: `test/${orgId}/${documentId}/test-passport.pdf`,
      requirementId: applicantReqId,
    },
  });

  return { documentId, requirementId, applicantReqId };
}

/**
 * Delete all test data for an org in the correct FK-safe order.
 * Call in afterAll to keep the DB clean between test runs.
 */
export async function teardownOrg(orgId: string): Promise<void> {
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM notifications WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM portal_invitations WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM portal_refresh_tokens WHERE "portalAccountId" IN (SELECT id FROM portal_accounts WHERE "organizationId" = '${orgId}')`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM portal_accounts WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM refresh_tokens WHERE "staffId" IN (SELECT id FROM staff WHERE "organizationId" = '${orgId}')`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM password_reset_tokens WHERE "staffId" IN (SELECT id FROM staff WHERE "organizationId" = '${orgId}')`,
  );
  await rawPrisma.$executeRawUnsafe(`DELETE FROM audit_logs WHERE "organizationId" = '${orgId}'`);
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicant_activities WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicant_notes WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(`DELETE FROM documents WHERE "organizationId" = '${orgId}'`);
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicant_document_requirements WHERE "applicantId" IN (SELECT id FROM applicants WHERE "organizationId" = '${orgId}')`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM document_requirements WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM workflow_history WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicant_workflows WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM workflow_stages WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM applicant_assignments WHERE "organizationId" = '${orgId}'`,
  );
  await rawPrisma.$executeRawUnsafe(`DELETE FROM applicants WHERE "organizationId" = '${orgId}'`);
  await rawPrisma.$executeRawUnsafe(`DELETE FROM staff WHERE "organizationId" = '${orgId}'`);
  await rawPrisma.$executeRawUnsafe(
    `DELETE FROM role_permissions WHERE "roleId" IN (SELECT id FROM roles WHERE "organizationId" = '${orgId}')`,
  );
  await rawPrisma.$executeRawUnsafe(`DELETE FROM roles WHERE "organizationId" = '${orgId}'`);
  await rawPrisma.$executeRawUnsafe(`DELETE FROM organizations WHERE id = '${orgId}'`);
}
