import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          items: [],
        },
      });
    }

    return cart;
  }

  async updateCart(userId: number, updateCartDto: UpdateCartDto) {
    // Upsert cart (create if doesn't exist, update if exists)
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {
        items: updateCartDto.items as any,
        updatedAt: new Date(),
      },
      create: {
        userId,
        items: updateCartDto.items as any,
      },
    });

    return cart;
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return { message: 'Cart already empty' };
    }

    await this.prisma.cart.update({
      where: { userId },
      data: {
        items: [],
        updatedAt: new Date(),
      },
    });

    return { message: 'Cart cleared successfully' };
  }
}
