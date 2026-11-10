import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './api/configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle('GymCRM - Microsserviço de Matrículas (Azure SQL)')
    .setDescription('CRUD de matrículas (criação, renovação, trancamento e cancelamento) persistido no Azure SQL. Publica o evento EnrollmentCreated (documentação em /events).')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('swagger', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3002);
  await app.listen(port, '0.0.0.0');
  console.log(`ms-matriculas-sql listening on :${port} (Swagger: /swagger, Events: /events)`);
}
bootstrap();
