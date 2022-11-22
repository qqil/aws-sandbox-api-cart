import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';

const port = process.env.PORT || 4000;
let app;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());

  await app.listen(port);

  return app;
}

export const appHandler = async (event, context) => {
  if (!app)
    app = serverlessExpress({
      app: (await bootstrap()).getHttpAdapter().getInstance(),
    });

  return app(event, context);
};
