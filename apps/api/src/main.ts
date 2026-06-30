import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { globalValidationPipe } from './common/pipes/validation.pipe';
import { type AppConfig, APP_CONFIG_KEY, type CorsConfig, CORS_CONFIG_KEY } from './config';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  const config = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const logger = new Logger('Bootstrap');

  const appCfg = config.get<AppConfig>(APP_CONFIG_KEY);
  const corsCfg = config.get<CorsConfig>(CORS_CONFIG_KEY);

  app.enableShutdownHooks();
  app.use(helmet());
  app.use(cookieParser());
  app.setGlobalPrefix(`${appCfg?.apiPrefix ?? 'api'}/${appCfg?.apiVersion ?? 'v1'}`);
  app.enableCors({
    origin: corsCfg?.origin ?? 'http://localhost:3000',
    credentials: corsCfg?.credentials ?? true,
  });

  // Global pipes, filters, interceptors, guards
  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Swagger
  if (appCfg?.nodeEnv !== 'production') {
    const swaggerDoc = new DocumentBuilder()
      .setTitle('Document Workflow Platform API')
      .setDescription('REST API for the Document Workflow Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerDoc);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger available at http://localhost:${appCfg?.port ?? 3001}/api/docs`);
  }

  const port = appCfg?.port ?? 3001;
  await app.listen(port);

  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Environment: ${appCfg?.nodeEnv ?? 'development'}`);
}

void bootstrap();
