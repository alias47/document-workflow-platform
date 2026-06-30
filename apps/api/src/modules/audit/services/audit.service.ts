import { Injectable, Logger } from '@nestjs/common';

import { AuditRepository, type CreateAuditLogInput } from '../repositories/audit.repository';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepo: AuditRepository) {}

  async log(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.auditRepo.create(input);
    } catch (err) {
      // Audit failures must never break the main flow
      this.logger.error('Failed to write audit log', err);
    }
  }
}
