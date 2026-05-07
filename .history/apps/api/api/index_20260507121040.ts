import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

import express from 'express';
import serverlessExpress from '@vendia/serverless-express';

const expressApp = express();

let server: any;

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );

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

  return serverlessExpress({
    app: expressApp,
  });
}

export default async function handler(req: any, res: any) {
  try {
    if (!server) {
      console.log('[Bootstrap] Starting NestJS app initialization...');
      console.log('[Bootstrap] DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
      console.log('[Bootstrap] NODE_ENV:', process.env.NODE_ENV);
      
      server = await bootstrap();
      
      console.log('[Bootstrap] NestJS app initialized successfully');
    }

    return server(req, res);
  } catch (error) {
    const logger = new Logger('ServerlessHandler');
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('[Handler Error] Message:', errorMessage);
    console.error('[Handler Error] Stack:', errorStack);
    logger.error('Handler error:', error);
    
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal Server Error',
    });
  }
}