import "reflect-metadata";
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { registerWithEureka } from './eureka';

async function bootstrap() {
  // CORS is handled by Spring Cloud Gateway — do NOT enable here to avoid duplicate headers
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = Number(process.env.PORT) || 8087;
  await app.listen(port);
  registerWithEureka(port);
  console.log(`Notification service running on ${port}`);
}
bootstrap();
