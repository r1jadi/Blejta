import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule, { cors: true });
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
