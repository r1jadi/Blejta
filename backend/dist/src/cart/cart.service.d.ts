import { PrismaService } from '../prisma.service';
import { UpdateCartDto } from './dto/update-cart.dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: number): Promise<{
        id: number;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        userId: number;
    }>;
    updateCart(userId: number, updateCartDto: UpdateCartDto): Promise<{
        id: number;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        userId: number;
    }>;
    clearCart(userId: number): Promise<{
        message: string;
    }>;
}
