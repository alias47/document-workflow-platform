import { Module } from '@nestjs/common';

import { NotesController } from './controllers/notes.controller';
import { NotesRepository } from './repositories/notes.repository';
import { NotesService } from './services/notes.service';

import { AuditModule } from '@/modules/audit/audit.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
})
export class NotesModule {}
