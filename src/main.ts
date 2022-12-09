import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { ValidationPipe } from '@nestjs/common';

let app;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });

  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.init();

  return serverlessExpress({
    app: app.getHttpAdapter().getInstance(),
  });
}

export const appHandler: APIGatewayProxyHandler = async (
  event,
  context,
  callback,
) => {
  if (!app) app = await bootstrap();

  return app(event, context, callback);
};
