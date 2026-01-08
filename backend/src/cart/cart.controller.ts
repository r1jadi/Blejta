import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Put()
  async updateCart(@Request() req, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.updateCart(req.user.id, updateCartDto);
  }

  @Post('clear')
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
