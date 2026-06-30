import path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig, corsConfig, databaseConfig, envValidationSchema, jwtConfig } from './config';
import { ApplicantModule } from './modules/applicant/applicant.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { StaffModule } from './modules/staff/staff.module';
import { PrismaModule } from './prisma/prisma.module';

const ENV_FILES = [
  path.resolve(process.cwd(), '../../.env.local'),
  path.resolve(process.cwd(), '../../.env'),
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV_FILES,
      load: [appConfig, databaseConfig, jwtConfig, corsConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 10 },
      { name: 'long', ttl: 3_600_000, limit: 100 },
    ]),
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.' }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const isProd = cfg.get('app.nodeEnv') === 'production';
        const baseOpts = {
          level: isProd ? ('info' as const) : ('debug' as const),
          redact: ['req.headers.authorization', 'req.headers.cookie'],
        };
        return {
          pinoHttp: isProd
            ? baseOpts
            : { ...baseOpts, transport: { target: 'pino-pretty', options: { colorize: true } } },
        };
      },
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    OrganizationModule,
    StaffModule,
    ApplicantModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
