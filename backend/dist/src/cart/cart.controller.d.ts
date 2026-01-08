import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any): Promise<{
        id: number;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        userId: number;
    }>;
    updateCart(req: any, updateCartDto: UpdateCartDto): Promise<{
        id: number;
        updatedAt: Date;
        items: import("@prisma/client/runtime/library").JsonValue;
        userId: number;
    }>;
    clearCart(req: any): Promise<{
        message: string;
    }>;
}
