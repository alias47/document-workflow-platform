import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { SystemSettingsRepository } from '../repositories/system-settings.repository';

import type { UpdateSettingsDto } from '../dto/update-settings.dto';
import type { Organization } from '@prisma/client';

import { ACTIVITY_TYPES } from '@/modules/activity/interfaces/activity-type';
import { AuditService } from '@/modules/audit/services/audit.service';
import {
  STORAGE_PROVIDER,
  type StorageProvider,
} from '@/modules/storage/interfaces/storage-provider.interface';

const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_LOGO_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
const LOGO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

@Injectable()
export class SystemSettingsService {
  constructor(
    private readonly settingsRepo: SystemSettingsRepository,
    private readonly auditService: AuditService,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async getSettings(organizationId: string): Promise<Organization> {
    const org = await this.settingsRepo.findById(organizationId);
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateSettings(
    organizationId: string,
    dto: UpdateSettingsDto,
    actorId: string,
  ): Promise<Organization> {
    const org = await this.settingsRepo.findById(organizationId);
    if (!org) throw new NotFoundException('Organization not found');

    const updated = await this.settingsRepo.update(organizationId, dto);

    void this.auditService.log({
      organizationId,
      actorId,
      actorType: 'staff',
      action: ACTIVITY_TYPES.SETTINGS_UPDATED,
      resourceType: 'organization',
      resourceId: organizationId,
      metadata: { fields: Object.keys(dto) },
    });

    return updated;
  }

  async uploadLogo(
    organizationId: string,
    file: Express.Multer.File | undefined,
    actorId: string,
  ): Promise<Organization> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('No logo file provided');
    }

    if (!ALLOWED_LOGO_MIMES.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported logo type: ${file.mimetype}. Use JPEG, PNG, WebP, or SVG.`,
      );
    }

    if (file.size > LOGO_MAX_BYTES) {
      throw new BadRequestException('Logo exceeds the maximum size of 5 MB');
    }

    const org = await this.settingsRepo.findById(organizationId);
    if (!org) throw new NotFoundException('Organization not found');

    const ext = LOGO_EXTENSIONS[file.mimetype] ?? '.png';
    const storedFilename = `logo-${Date.now()}${ext}`;

    // Upload new logo first; capture the provider-assigned key
    const { storageKey } = await this.storage.upload({
      organizationId,
      applicantId: 'branding',
      storedFilename,
      buffer: file.buffer,
    });

    // Only delete the old logo after the new one is confirmed stored
    if (org.logoKey) {
      await this.storage.delete(org.logoKey).catch(() => undefined);
    }

    const updated = await this.settingsRepo.update(organizationId, { logoKey: storageKey });

    void this.auditService.log({
      organizationId,
      actorId,
      actorType: 'staff',
      action: ACTIVITY_TYPES.SETTINGS_LOGO_UPDATED,
      resourceType: 'organization',
      resourceId: organizationId,
    });

    return updated;
  }

  async removeLogo(organizationId: string, actorId: string): Promise<Organization> {
    const org = await this.settingsRepo.findById(organizationId);
    if (!org) throw new NotFoundException('Organization not found');

    if (org.logoKey) {
      await this.storage.delete(org.logoKey).catch(() => undefined);
    }

    const updated = await this.settingsRepo.update(organizationId, { logoKey: null });

    void this.auditService.log({
      organizationId,
      actorId,
      actorType: 'staff',
      action: ACTIVITY_TYPES.SETTINGS_LOGO_REMOVED,
      resourceType: 'organization',
      resourceId: organizationId,
    });

    return updated;
  }
}
