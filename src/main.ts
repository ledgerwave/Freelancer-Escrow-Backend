import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Request logging
  app.use(morgan('combined'));

  // Enable validation pipes globally
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Configure CORS
  app.enableCors({
    origin: configService.get('security.corsOrigins'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Cardano Escrow Marketplace API')
    .setDescription(`A comprehensive backend API for a Cardano-based freelancer escrow marketplace.`)
    .setVersion('1.0.0')
    .addTag('App', 'Application health and status endpoints')
    .addTag('Escrows', 'Escrow management and operations')
    .addTag('Disputes', 'Dispute resolution and arbitration')
    .addTag('Notifications', 'User notifications and messaging')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addServer('http://localhost:5000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get('port');
  const nodeEnv = configService.get('nodeEnv');

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/docs`);
  logger.log(`Test endpoint: http://localhost:${port}/test`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(`Security: Helmet, CORS, Rate limiting enabled`);
  logger.log(`Monitoring: Request logging and compression enabled`);
}
bootstrap();
