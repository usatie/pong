import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // enable CORS
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // enable validation

  const config = new DocumentBuilder()
    .setTitle('Pong API')
    .setDescription('The Pong API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
