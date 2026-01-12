import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    // userId is required - user must be authenticated
    if (!data.userId) {
      throw new Error('User ID is required. User must be authenticated to place an order.');
    }
    
    // Handle payment method logic similar to createOrder
    const paymentMethod = data.paymentMethod || 'card';
    const status = paymentMethod === 'cash_on_delivery' 
      ? 'confirmed' 
      : (data.status || 'pending');
    const paymentStatus = paymentMethod === 'cash_on_delivery' 
      ? 'cash_on_delivery' 
      : (data.paymentStatus || 'pending');
    
    return this.prisma.order.create({
      data: {
        ...data,
        status,
        paymentStatus,
      }
    });
  }

  createOrder(createOrderDto: CreateOrderDto) {
    const paymentMethod = createOrderDto.paymentMethod || 'card';
    
    // For cash on delivery, automatically set status to confirmed and payment status to cash_on_delivery
    const status = paymentMethod === 'cash_on_delivery' 
      ? 'confirmed' 
      : (createOrderDto.status || 'pending');
    
    const paymentStatus = paymentMethod === 'cash_on_delivery' 
      ? 'cash_on_delivery' 
      : (createOrderDto.paymentStatus || 'pending');

    // userId is required - user must be authenticated
    if (!createOrderDto.userId) {
      throw new Error('User ID is required. User must be authenticated to place an order.');
    }

    return this.prisma.order.create({
      data: {
        userId: createOrderDto.userId,
        items: createOrderDto.items,
        name: createOrderDto.name,
        address: createOrderDto.address,
        phone: createOrderDto.phone,
        subtotal: createOrderDto.subtotal,
        shippingCost: createOrderDto.shippingCost,
        total: createOrderDto.total,
        status,
        paymentMethod,
        paymentStatus,
        paymentIntentId: createOrderDto.paymentIntentId || null,
      }
    });
  }

  findAll() {
    return this.prisma.order.findMany({ 
      orderBy: { id: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  findByUserId(userId: number) {
    return this.prisma.order.findMany({ 
      where: { userId },
      orderBy: { id: 'desc' } 
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({ 
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Prepare update data
    const updateData: any = {};

    if (updateOrderDto.userId !== undefined) {
      updateData.userId = updateOrderDto.userId;
    }
    if (updateOrderDto.items !== undefined) {
      updateData.items = updateOrderDto.items;
    }
    if (updateOrderDto.name !== undefined) {
      updateData.name = updateOrderDto.name;
    }
    if (updateOrderDto.address !== undefined) {
      updateData.address = updateOrderDto.address;
    }
    if (updateOrderDto.phone !== undefined) {
      updateData.phone = updateOrderDto.phone;
    }
    if (updateOrderDto.subtotal !== undefined) {
      updateData.subtotal = updateOrderDto.subtotal;
    }
    if (updateOrderDto.shippingCost !== undefined) {
      updateData.shippingCost = updateOrderDto.shippingCost;
    }
    if (updateOrderDto.total !== undefined) {
      updateData.total = updateOrderDto.total;
    }
    if (updateOrderDto.status !== undefined) {
      updateData.status = updateOrderDto.status;
    }
    if (updateOrderDto.paymentMethod !== undefined) {
      updateData.paymentMethod = updateOrderDto.paymentMethod;
    }
    if (updateOrderDto.paymentStatus !== undefined) {
      updateData.paymentStatus = updateOrderDto.paymentStatus;
    }
    if (updateOrderDto.paymentIntentId !== undefined) {
      updateData.paymentIntentId = updateOrderDto.paymentIntentId;
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  updateStatus(id: number, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  async remove(id: number) {
    // Check if order exists
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Delete order
    await this.prisma.order.delete({
      where: { id },
    });

    return { message: 'Order deleted successfully' };
  }
}

