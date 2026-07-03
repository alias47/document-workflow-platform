import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ApplicantAuthController } from './controllers/applicant-auth.controller';
import { ApplicantJwtGuard } from './guards/applicant-jwt.guard';
import { ApplicantAuthRepository } from './repositories/applicant-auth.repository';
import { ApplicantAuthService } from './services/applicant-auth.service';
import { ApplicantJwtStrategy } from './strategies/applicant-jwt.strategy';

import { AuditModule } from '@/modules/audit/audit.module';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService } from '@/providers/token/token.service';

@Module({
  imports: [PassportModule, JwtModule.register({}), AuditModule],
  controllers: [ApplicantAuthController],
  providers: [
    ApplicantAuthService,
    ApplicantAuthRepository,
    ApplicantJwtStrategy,
    ApplicantJwtGuard,
    PasswordService,
    TokenService,
  ],
  exports: [ApplicantAuthService, ApplicantJwtStrategy, ApplicantJwtGuard],
})
export class ApplicantAuthModule {}
