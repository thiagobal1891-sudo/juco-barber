import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as serverless from 'serverless-http';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

const server = express();

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    {
      logger: ['error', 'warn', 'log', 'debug'],
    },
  );

  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );

  // Root redirect
  server.get('/', (req: express.Request, res: express.Response) => {
    res.redirect(frontendUrl);
  });

  // API health check
  server.get('/api/v1', (req: express.Request, res: express.Response) => {
    res.status(200).json({
      success: true,
      message: 'Vaon API is running!',
      portal: `Visit the Landing Page at ${frontendUrl}`,
      timestamp: new Date().toISOString(),
    });
  });

  // CORS
  app.enableCors({
    origin: [
      frontendUrl,
      /\.barberos\.app$/,
      'https://TU-FRONTEND.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Prefix
  app.setGlobalPrefix('api/v1');

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.init();

  logger.log('✅ NestJS initialized for Vercel');
}

bootstrap();

export default serverless(server);