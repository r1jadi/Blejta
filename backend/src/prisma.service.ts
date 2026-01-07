import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      log: ['error', 'warn'],
    });
    // Prisma connects lazily on first query - no need to block startup
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
