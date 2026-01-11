"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const bcrypt = require("bcrypt");
const cart_service_1 = require("../cart/cart.service");
const email_service_1 = require("../email/email.service");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwtService, cartService, emailService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.cartService = cartService;
        this.emailService = emailService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, password, name } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'user',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role
        }, { expiresIn: '24h' });
        const cart = await this.cartService.getCart(user.id);
        return {
            user,
            token,
            cart: cart.items,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const expiresIn = user.role === 'admin' ? '1h' : '24h';
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role
        }, { expiresIn });
        let cart = null;
        if (user.role === 'user') {
            const userCart = await this.cartService.getCart(user.id);
            cart = userCart.items;
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
            },
            token,
            cart,
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        return user;
    }
    async logout(userId) {
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return { message: 'If an account with that email exists, a password reset link has been sent.' };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        await this.emailService.sendPasswordResetEmail(email, resetToken, resetUrl);
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }
    async resetPassword(resetPasswordDto) {
        const { token, password } = resetPasswordDto;
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (password.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters long');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        return { message: 'Password has been reset successfully' };
    }
    async updateProfile(userId, updateProfileDto) {
        const { email, newPassword, confirmPassword, currentPassword } = updateProfileDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        if (newPassword) {
            if (!confirmPassword) {
                throw new common_1.BadRequestException('Confirm password is required when changing password');
            }
            if (newPassword !== confirmPassword) {
                throw new common_1.BadRequestException('New password and confirm password do not match');
            }
            if (newPassword.length < 6) {
                throw new common_1.BadRequestException('Password must be at least 6 characters long');
            }
        }
        if (email && email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email is already in use');
            }
        }
        const updateData = {};
        if (email && email !== user.email) {
            updateData.email = email;
        }
        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }
        if (Object.keys(updateData).length === 0) {
            throw new common_1.BadRequestException('No changes to update');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        const token = this.jwtService.sign({
            sub: updatedUser.id,
            email: updatedUser.email,
            role: updatedUser.role
        }, { expiresIn: updatedUser.role === 'admin' ? '1h' : '24h' });
        return {
            user: updatedUser,
            token,
            message: 'Profile updated successfully',
            passwordChanged: !!newPassword,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        cart_service_1.CartService,
        email_service_1.EmailService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map