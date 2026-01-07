import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({ orderBy: { id: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }
}
