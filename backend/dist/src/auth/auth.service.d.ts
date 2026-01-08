import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CartService } from '../cart/cart.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private cartService;
    constructor(prisma: PrismaService, jwtService: JwtService, cartService: CartService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
            createdAt: Date;
        };
        token: string;
        cart: import("@prisma/client/runtime/library").JsonValue;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
            createdAt: Date;
        };
        token: string;
        cart: any;
    }>;
    validateUser(userId: number): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }>;
    logout(userId: number): Promise<{
        message: string;
    }>;
}
