import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class EmailService implements OnModuleInit {
    private configService;
    private readonly logger;
    private transporter;
    private fromEmail;
    private fromName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeTransporter;
    sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<{
        success: boolean;
        sent: boolean;
        mode: string;
        messageId?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        sent: boolean;
        messageId: any;
        mode?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        sent: boolean;
        error: any;
        mode: string;
        messageId?: undefined;
    }>;
    private getPasswordResetEmailTemplate;
}
