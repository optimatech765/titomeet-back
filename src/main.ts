import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
config();

async function bootstrap() {
  //enable cors
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('TitoMeet API')
    .setDescription('TitoMeet API for managing events and attendees')
    .setVersion('1.0')
    .addTag('TitoMeet')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
