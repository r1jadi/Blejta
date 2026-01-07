import { PrismaService } from '../prisma.service';
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
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
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
    findOne(id: number): import(".prisma/client").Prisma.Prisma__OrderClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
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
        paymentIntentId: string | null;
        paymentStatus: string;
        userId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
