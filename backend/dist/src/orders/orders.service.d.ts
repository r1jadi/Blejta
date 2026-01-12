import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): import(".prisma/client").Prisma.Prisma__OrderClient<{
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
        paymentMethod: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
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
        paymentMethod: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
        paymentMethod: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    })[]>;
    findByUserId(userId: number): import(".prisma/client").Prisma.PrismaPromise<{
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
        paymentMethod: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }[]>;
    findOne(id: number): Promise<{
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
        paymentMethod: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }>;
    update(id: number, updateOrderDto: UpdateOrderDto): Promise<{
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
        paymentMethod: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }>;
    updateStatus(id: number, status: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
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
        paymentMethod: string;
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
