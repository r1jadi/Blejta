import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly jwtService;
    private readonly prisma;
    constructor(ordersService: OrdersService, jwtService: JwtService, prisma: PrismaService);
    create(body: any, authHeader?: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }>;
    createOrder(createOrderDto: CreateOrderDto): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    getAll(): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    })[]>;
    getMyOrders(req: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }[]>;
    getOne(id: string): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }>;
    updateStatus(id: string, status: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
