import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { json, raw } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule, { 
      cors: true,
      rawBody: true, // Enable raw body for Stripe webhooks
    });
    
    // Use raw body parser for Stripe webhook endpoint
    app.use('/payments/webhook', raw({ type: 'application/json' }));
    
    // Use JSON parser for all other routes
    app.use(json());
    
    // ValidationPipe removed temporarily - install class-validator to enable
    // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.listen(7058);
    logger.log('🚀 Backend running at http://localhost:7058');
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}
bootstrap();
