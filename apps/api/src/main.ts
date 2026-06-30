import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { type AppConfig, APP_CONFIG_KEY, type CorsConfig, CORS_CONFIG_KEY } from './config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const appCfg = config.get<AppConfig>(APP_CONFIG_KEY);
  const corsCfg = config.get<CorsConfig>(CORS_CONFIG_KEY);

  app.enableShutdownHooks();
  app.setGlobalPrefix(`${appCfg?.apiPrefix ?? 'api'}/${appCfg?.apiVersion ?? 'v1'}`);
  app.enableCors({
    origin: corsCfg?.origin ?? 'http://localhost:3000',
    credentials: corsCfg?.credentials ?? false,
  });

  const port = appCfg?.port ?? 3001;
  await app.listen(port);

  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Environment: ${appCfg?.nodeEnv ?? 'development'}`);
}

void bootstrap();
