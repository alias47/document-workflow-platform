import { Module } from '@nestjs/common';

import { StaffController } from './controllers/staff.controller';
import { StaffRepository } from './repositories/staff.repository';
import { StaffService } from './services/staff.service';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [StaffController],
  providers: [StaffService, StaffRepository],
  exports: [StaffService, StaffRepository],
})
export class StaffModule {}
