import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CartService } from '../cart/cart.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private prisma;
    private jwtService;
    private cartService;
    private emailService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, cartService: CartService, emailService: EmailService, configService: ConfigService);
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
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<{
        user: {
            id: number;
            email: string;
            name: string;
            role: string;
            createdAt: Date;
        };
        token: string;
        message: string;
        passwordChanged: boolean;
    }>;
}
