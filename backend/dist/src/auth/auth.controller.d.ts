import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<any>;
    logout(req: any): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<{
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
