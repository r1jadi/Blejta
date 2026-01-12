import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { CartModule } from './cart/cart.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '../.env', '../../.env'], // Look for .env in current dir, parent, and grandparent
      isGlobal: true,
    }),
    ProductsModule,
    OrdersModule,
    AuthModule,
    PaymentsModule,
    CartModule,
    UsersModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
