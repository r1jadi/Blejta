import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@example.com';
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'Blejta';
  }

  async onModuleInit() {
    await this.initializeTransporter();
  }

  private async initializeTransporter() {
    const emailService = this.configService.get<string>('EMAIL_SERVICE');
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPortStr = this.configService.get<string>('SMTP_PORT');
    const smtpPort = smtpPortStr ? parseInt(smtpPortStr, 10) : 587;
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';

    // If no email configuration is provided, use console logging (development mode)
    if (!emailService && !smtpHost && !smtpUser) {
      this.logger.warn('No email configuration found. Email sending will be logged to console only.');
      this.logger.warn('Set EMAIL_SERVICE or SMTP_* environment variables to enable email sending.');
      return;
    }

    try {
      if (emailService === 'gmail') {
        // Gmail configuration
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser || this.configService.get<string>('GMAIL_USER'),
            pass: smtpPassword || this.configService.get<string>('GMAIL_APP_PASSWORD'),
          },
        });
        this.logger.log('Email service initialized: Gmail');
      } else if (emailService === 'sendgrid') {
        // SendGrid configuration (using SMTP)
        const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
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
        // For SendGrid, EMAIL_FROM should be a verified sender in SendGrid
        this.logger.log('Email service initialized: SendGrid');
      } else if (emailService === 'mailgun') {
        // Mailgun configuration (using SMTP)
        const mailgunApiKey = this.configService.get<string>('MAILGUN_API_KEY');
        const mailgunDomain = this.configService.get<string>('MAILGUN_DOMAIN');
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
      } else if (emailService === 'ses') {
        // AWS SES configuration (using SMTP)
        const sesRegion = this.configService.get<string>('AWS_SES_REGION') || 'us-east-1';
        const sesAccessKey = this.configService.get<string>('AWS_SES_ACCESS_KEY');
        const sesSecretKey = this.configService.get<string>('AWS_SES_SECRET_KEY');
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
      } else if (emailService === 'outlook' || emailService === 'hotmail') {
        // Outlook/Hotmail configuration
        this.transporter = nodemailer.createTransport({
          service: 'hotmail',
          auth: {
            user: smtpUser || this.configService.get<string>('OUTLOOK_USER'),
            pass: smtpPassword || this.configService.get<string>('OUTLOOK_PASSWORD'),
          },
        });
        this.logger.log('Email service initialized: Outlook/Hotmail');
      } else if (smtpHost) {
        // Generic SMTP configuration
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
      } else {
        this.logger.warn('Email configuration incomplete. Email sending will be logged to console only.');
        return;
      }

      // Verify transporter configuration
      await this.transporter.verify();
      this.logger.log('Email transporter verified successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.logger.warn('Email sending will be logged to console only.');
      this.transporter = null;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
    const subject = 'Reset Your Password';
    const html = this.getPasswordResetEmailTemplate(resetUrl);

    // If transporter is not configured, log to console (development mode)
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
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      this.logger.error(`Failed to send password reset email to ${email}:`, errorMessage);
      
      // Fallback to console logging if email sending fails
      this.logger.warn('Falling back to console logging...');
      console.log('\n=== PASSWORD RESET EMAIL (FALLBACK) ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Reset Link: ${resetUrl}`);
      console.log('========================================\n');
      
      return { success: false, sent: false, error: errorMessage, mode: 'console' };
    }
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
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
}
