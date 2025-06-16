/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';
import { Migrator } from '@unic/database';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use(cookieParser());

  const migrator = app.get(Migrator);

  await migrator.migrate(join(__dirname, './migrations'));

  const config = new DocumentBuilder()
    .setTitle('Unic API')
    .setDescription('The Unic API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix, app, document);

  const port = process.env.PORT || 3000;

  const server = app.getHttpServer();
  const timeout = 3 * 60 * 60 * 1000; // upload-zip timeout - 3 hours
  // The timeout value for sockets
  server.setTimeout(timeout);
  // The number of milliseconds of inactivity a server needs to wait for additional incoming data
  server.keepAliveTimeout = 30000;
  // Limit the amount of time the parser will wait to receive the complete HTTP headers
  server.headersTimeout = timeout;

  app.use(json({ limit: '24mb' }));
  app.use(urlencoded({ extended: true, limit: '24mb' }));

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
