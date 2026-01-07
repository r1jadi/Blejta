import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(body: any): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: number;
        name: string;
        createdAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    getAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        createdAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        userId: number | null;
    }[]>;
    getOne(id: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: number;
        name: string;
        createdAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        userId: number | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updateStatus(id: string, status: string): import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: number;
        name: string;
        createdAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        address: string;
        phone: string;
        subtotal: number | null;
        shippingCost: number | null;
        total: number | null;
        status: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
