import { Body, Controller, Get, Param, Patch, Post, Put, Delete, UseGuards, Request, Headers } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async create(@Body() body: any, @Headers('authorization') authHeader?: string) {
    // Try to extract userId from JWT token if present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = this.jwtService.verify(token);
        if (decoded && decoded.sub) {
          // Verify user exists
          const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
          if (user) {
            body.userId = user.id;
          }
        }
      } catch (error) {
        // Token invalid or expired, continue without userId (guest order)
        console.log('Failed to decode token for order creation, creating guest order');
      }
    }
    return this.ordersService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/create')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  getAll() {
    return this.ordersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  getMyOrders(@Request() req: any) {
    const userId = req.user.id;
    return this.ordersService.findByUserId(userId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.ordersService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(Number(id), updateOrderDto);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(Number(id), status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(Number(id));
  }
}

