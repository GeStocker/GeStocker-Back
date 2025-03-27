import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express'; // Importación agregada

async function bootstrap() {
  // Especificamos el tipo NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuración del proxy de confianza
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Configuración de Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Gestocker')
    .setDescription('API para gestionar inventarios')
    .setVersion('1.0.0')  
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Configuración CORS actualizada
  app.enableCors({
    origin: ['http://localhost:3001', 'https://ge-stocker.vercel.app'],
    methods: 'GET, PUT, POST, DELETE, PATCH',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Middlewares
  const logger = new LoggerMiddleware();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(logger.use);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();