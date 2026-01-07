import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.order.create({ data });
  }

  findAll() {
    return this.prisma.order.findMany({ orderBy: { id: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({ where: { id } });
  }

  updateStatus(id: number, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}
