import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

import express from 'express';
import serverlessExpress from '@vendia/serverless-express';

const expressApp = express();

let server: any;

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.enableCors();

  app.setGlobalPrefix('api/v1');

  await app.init();

  return serverlessExpress({
    app: expressApp,
  });
}

export default async function handler(req: any, res: any) {
  if (!server) {
    server = await bootstrap();
  }

  return server(req, res);
}