import { PrismaService } from '../prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        images: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__ProductClient<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        images: import("@prisma/client/runtime/library").JsonValue;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
