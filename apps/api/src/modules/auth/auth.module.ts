import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './controllers/auth.controller';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { AuditModule } from '@/modules/audit/audit.module';
import { EMAIL_PROVIDER } from '@/providers/email/email-provider.interface';
import { MockEmailProvider } from '@/providers/email/mock-email.provider';
import { PasswordService } from '@/providers/password/password.service';
import { TokenService } from '@/providers/token/token.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    PasswordService,
    TokenService,
    { provide: EMAIL_PROVIDER, useClass: MockEmailProvider },
  ],
  exports: [AuthService, JwtStrategy, PasswordService, TokenService],
})
export class AuthModule {}
