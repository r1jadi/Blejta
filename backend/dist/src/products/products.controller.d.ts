import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        images: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getOne(id: string): import(".prisma/client").Prisma.Prisma__ProductClient<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        images: import("@prisma/client/runtime/library").JsonValue;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
