import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '@/common/decorators/permissions.decorator';
import { ApplicantInvitationController } from '@/modules/applicant-invitation/controllers/applicant-invitation.controller';
import { NotificationController } from '@/modules/notification/controllers/notification.controller';
import { ReportController } from '@/modules/report/controllers/report.controller';
import { SystemSettingsController } from '@/modules/system-settings/controllers/system-settings.controller';

/**
 * Sprint 12.2 — RBAC consistency guard.
 *
 * The audit found permissions that controllers enforced but the seed never
 * created (report.view / report.export → 403 for everyone) and role decorators
 * (@Roles('super_admin')) that referenced a role no seed creates (→ unreachable).
 *
 * This mirrors the seeded permission catalogue from prisma/seed.ts. If a
 * controller starts requiring a permission that is not seeded, the assertion
 * below fails — catching the "enforced-but-unseeded" regression class at CI time.
 * Keep this list in sync with prisma/seed.ts PERMISSIONS.
 */
const SEEDED_PERMISSIONS = new Set([
  'staff.view',
  'staff.create',
  'staff.update',
  'staff.delete',
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
  'search.view',
  'dashboard.view',
  'dashboard.workload.view',
  'report.view',
  'report.export',
  'notification.view',
  'notification.manage',
  'audit.view',
  'settings.manage',
]);

// Controllers whose authorization changed (or was validated) in Sprint 12.2.
const CONTROLLERS_UNDER_TEST = [
  ApplicantInvitationController,
  NotificationController,
  ReportController,
  SystemSettingsController,
];

function collectRequiredPermissions(controller: new (...args: never[]) => object): string[] {
  const reflector = new Reflector();
  const proto = controller.prototype as Record<string, unknown>;
  const found: string[] = [];
  for (const name of Object.getOwnPropertyNames(proto)) {
    if (name === 'constructor') continue;
    const handler = proto[name];
    if (typeof handler !== 'function') continue;
    const perms = reflector.get<string[]>(PERMISSIONS_KEY, handler);
    if (perms) found.push(...perms);
  }
  return found;
}

describe('RBAC permission consistency (Sprint 12.2)', () => {
  it('every permission required by a touched controller exists in the seed catalogue', () => {
    const missing: { controller: string; permission: string }[] = [];

    for (const controller of CONTROLLERS_UNDER_TEST) {
      for (const permission of collectRequiredPermissions(controller)) {
        if (!SEEDED_PERMISSIONS.has(permission)) {
          missing.push({ controller: controller.name, permission });
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it('report endpoints require seeded report.* permissions', () => {
    const perms = collectRequiredPermissions(ReportController);
    expect(perms).toContain('report.view');
    expect(perms).toContain('report.export');
    expect(SEEDED_PERMISSIONS.has('report.view')).toBe(true);
    expect(SEEDED_PERMISSIONS.has('report.export')).toBe(true);
  });

  it('settings + notification endpoints use seeded permissions, not an unseeded role', () => {
    const settingsPerms = collectRequiredPermissions(SystemSettingsController);
    const notificationPerms = collectRequiredPermissions(NotificationController);

    expect(settingsPerms.every((p) => SEEDED_PERMISSIONS.has(p))).toBe(true);
    expect(notificationPerms.every((p) => SEEDED_PERMISSIONS.has(p))).toBe(true);
    expect(settingsPerms.length).toBeGreaterThan(0);
    expect(notificationPerms.length).toBeGreaterThan(0);
  });
});
