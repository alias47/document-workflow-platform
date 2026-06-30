import { Module } from '@nestjs/common';

import { StaffController } from './controllers/staff.controller';
import { StaffRepository } from './repositories/staff.repository';
import { StaffService } from './services/staff.service';

import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StaffController],
  providers: [StaffService, StaffRepository],
  exports: [StaffService],
})
export class StaffModule {}
