import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
            createdAt: Date;
        };
        token: string;
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
    }>;
    validateUser(userId: number): Promise<{
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }>;
}
