import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ICorsConfig } from './config/cors.config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { version } from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const configService = app.get(ConfigService);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RolloutCtrl API')
    .setDescription(
      'RolloutCtrl — open-source, self-hosted platform for feature flags, progressive delivery, and access control.',
    )
    .setVersion(version)
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // CORS
  const corsConfig = configService.getOrThrow<ICorsConfig>('cors');
  const corsOptions: CorsOptions = {
    origin: corsConfig.origin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors((req, callback) => {
    const isSdkRequest = req.originalUrl.includes('/sdk/client');

    if (isSdkRequest) {
      callback(null, {
        origin: true,
        credentials: false,
      });

      return;
    }

    callback(null, corsOptions);
  });

  app.useBodyParser('json', { limit: '10mb' });
  await app.listen(3000);
}
bootstrap();
