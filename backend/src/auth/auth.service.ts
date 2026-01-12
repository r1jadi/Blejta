import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CartService } from '../cart/cart.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private cartService: CartService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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

    // Generate JWT token with 24h expiration for users
    const token = this.jwtService.sign(
      { 
        sub: user.id, 
        email: user.email, 
        role: user.role 
      },
      { expiresIn: '24h' }
    );

    // Get or create cart for user
    const cart = await this.cartService.getCart(user.id);

    return {
      user,
      token,
      cart: cart.items,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token with different expiration based on role
    // Users: 24h, Admins: 1h (but will use sessionStorage so it clears on page close)
    const expiresIn = user.role === 'admin' ? '1h' : '24h';
    const token = this.jwtService.sign(
      { 
        sub: user.id, 
        email: user.email, 
        role: user.role 
      },
      { expiresIn }
    );

    // Get or create cart for user (only for regular users, not admins)
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

  async validateUser(userId: number) {
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

  async logout(userId: number) {
    // Don't clear cart from database - it should persist for next login
    // Only clear from frontend session (handled by frontend)
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success message (security best practice - don't reveal if email exists)
    if (!user) {
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token (cryptographically secure random token)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Save reset token to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset URL
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(email, resetToken, resetUrl);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;

    // Find user by reset token
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Validate password length
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
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

  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const { email, newPassword, confirmPassword, currentPassword } = updateProfileDto;

    // Find user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate if trying to update password
    if (newPassword) {
      if (!confirmPassword) {
        throw new BadRequestException('Confirm password is required when changing password');
      }
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('New password and confirm password do not match');
      }
      if (newPassword.length < 6) {
        throw new BadRequestException('Password must be at least 6 characters long');
      }
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email is already in use');
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (email && email !== user.email) {
      updateData.email = email;
    }

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No changes to update');
    }

    // Update user
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

    // Generate new token if email or password changed
    const token = this.jwtService.sign(
      { 
        sub: updatedUser.id, 
        email: updatedUser.email, 
        role: updatedUser.role 
      },
      { expiresIn: updatedUser.role === 'admin' ? '1h' : '24h' }
    );

    return {
      user: updatedUser,
      token,
      message: 'Profile updated successfully',
      passwordChanged: !!newPassword,
    };
  }
}
