import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  app.setGlobalPrefix('api');
  app.enableCors({
    origin:['http://localhost:4200', 'http://localhost:4300'],
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
    }),
  );

  // Config for Swagger
  const config = new DocumentBuilder() //1
    .setTitle('Back-End winted')
    .setDescription('Documentation pour le back-end de winted')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config); //2
  SwaggerModule.setup('api', app, document); //3

  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('port'));
}
bootstrap();
