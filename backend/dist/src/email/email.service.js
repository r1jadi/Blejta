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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporter = null;
        this.fromEmail = this.configService.get('EMAIL_FROM') || 'noreply@example.com';
        this.fromName = this.configService.get('EMAIL_FROM_NAME') || 'Blejta';
    }
    async onModuleInit() {
        await this.initializeTransporter();
    }
    async initializeTransporter() {
        const emailService = this.configService.get('EMAIL_SERVICE');
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPortStr = this.configService.get('SMTP_PORT');
        const smtpPort = smtpPortStr ? parseInt(smtpPortStr, 10) : 587;
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPassword = this.configService.get('SMTP_PASSWORD');
        const smtpSecure = this.configService.get('SMTP_SECURE') === 'true';
        if (!emailService && !smtpHost && !smtpUser) {
            this.logger.warn('No email configuration found. Email sending will be logged to console only.');
            this.logger.warn('Set EMAIL_SERVICE or SMTP_* environment variables to enable email sending.');
            return;
        }
        try {
            if (emailService === 'gmail') {
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: smtpUser || this.configService.get('GMAIL_USER'),
                        pass: smtpPassword || this.configService.get('GMAIL_APP_PASSWORD'),
                    },
                });
                this.logger.log('Email service initialized: Gmail');
            }
            else if (emailService === 'sendgrid') {
                const sendgridApiKey = this.configService.get('SENDGRID_API_KEY');
                if (!sendgridApiKey) {
                    throw new Error('SENDGRID_API_KEY is required when using SendGrid');
                }
                this.transporter = nodemailer.createTransport({
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'apikey',
                        pass: sendgridApiKey,
                    },
                });
                this.logger.log('Email service initialized: SendGrid');
            }
            else if (emailService === 'mailgun') {
                const mailgunApiKey = this.configService.get('MAILGUN_API_KEY');
                const mailgunDomain = this.configService.get('MAILGUN_DOMAIN');
                if (!mailgunApiKey || !mailgunDomain) {
                    throw new Error('MAILGUN_API_KEY and MAILGUN_DOMAIN are required when using Mailgun');
                }
                this.transporter = nodemailer.createTransport({
                    host: `smtp.mailgun.org`,
                    port: 587,
                    secure: false,
                    auth: {
                        user: `postmaster@${mailgunDomain}`,
                        pass: mailgunApiKey,
                    },
                });
                this.logger.log('Email service initialized: Mailgun');
            }
            else if (emailService === 'ses') {
                const sesRegion = this.configService.get('AWS_SES_REGION') || 'us-east-1';
                const sesAccessKey = this.configService.get('AWS_SES_ACCESS_KEY');
                const sesSecretKey = this.configService.get('AWS_SES_SECRET_KEY');
                if (!sesAccessKey || !sesSecretKey) {
                    throw new Error('AWS_SES_ACCESS_KEY and AWS_SES_SECRET_KEY are required when using AWS SES');
                }
                this.transporter = nodemailer.createTransport({
                    host: `email-smtp.${sesRegion}.amazonaws.com`,
                    port: 587,
                    secure: false,
                    auth: {
                        user: sesAccessKey,
                        pass: sesSecretKey,
                    },
                });
                this.logger.log(`Email service initialized: AWS SES (${sesRegion})`);
            }
            else if (emailService === 'outlook' || emailService === 'hotmail') {
                this.transporter = nodemailer.createTransport({
                    service: 'hotmail',
                    auth: {
                        user: smtpUser || this.configService.get('OUTLOOK_USER'),
                        pass: smtpPassword || this.configService.get('OUTLOOK_PASSWORD'),
                    },
                });
                this.logger.log('Email service initialized: Outlook/Hotmail');
            }
            else if (smtpHost) {
                this.transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort || 587,
                    secure: smtpSecure || false,
                    auth: smtpUser && smtpPassword ? {
                        user: smtpUser,
                        pass: smtpPassword,
                    } : undefined,
                });
                this.logger.log(`Email service initialized: SMTP (${smtpHost}:${smtpPort || 587})`);
            }
            else {
                this.logger.warn('Email configuration incomplete. Email sending will be logged to console only.');
                return;
            }
            await this.transporter.verify();
            this.logger.log('Email transporter verified successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize email transporter:', error);
            this.logger.warn('Email sending will be logged to console only.');
            this.transporter = null;
        }
    }
    async sendPasswordResetEmail(email, resetToken, resetUrl) {
        const subject = 'Reset Your Password';
        const html = this.getPasswordResetEmailTemplate(resetUrl);
        if (!this.transporter) {
            this.logger.log(`Password reset requested for: ${email}`);
            this.logger.log(`Reset token: ${resetToken}`);
            this.logger.log(`Reset URL: ${resetUrl}`);
            console.log('\n=== PASSWORD RESET EMAIL ===');
            console.log(`To: ${email}`);
            console.log(`Subject: ${subject}`);
            console.log(`Reset Link: ${resetUrl}`);
            console.log('===========================\n');
            return { success: true, sent: false, mode: 'console' };
        }
        try {
            const info = await this.transporter.sendMail({
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: email,
                subject,
                html,
            });
            this.logger.log(`Password reset email sent successfully to ${email} (MessageId: ${info.messageId})`);
            return { success: true, sent: true, messageId: info.messageId };
        }
        catch (error) {
            const errorMessage = error?.message || error?.toString() || 'Unknown error';
            this.logger.error(`Failed to send password reset email to ${email}:`, errorMessage);
            this.logger.warn('Falling back to console logging...');
            console.log('\n=== PASSWORD RESET EMAIL (FALLBACK) ===');
            console.log(`To: ${email}`);
            console.log(`Subject: ${subject}`);
            console.log(`Reset Link: ${resetUrl}`);
            console.log('========================================\n');
            return { success: false, sent: false, error: errorMessage, mode: 'console' };
        }
    }
    getPasswordResetEmailTemplate(resetUrl) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Reset Your Password</h1>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map