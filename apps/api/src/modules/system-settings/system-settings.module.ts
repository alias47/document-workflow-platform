import { forwardRef, Module } from '@nestjs/common';

import { SystemSettingsController } from './controllers/system-settings.controller';
import { SystemSettingsRepository } from './repositories/system-settings.repository';
import { SystemSettingsService } from './services/system-settings.service';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { StorageModule } from '@/modules/storage/storage.module';

@Module({
  imports: [forwardRef(() => AuthModule), AuditModule, StorageModule],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, SystemSettingsRepository],
  exports: [SystemSettingsService],
})
export class SystemSettingsModule {}
