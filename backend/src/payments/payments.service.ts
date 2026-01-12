import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Try multiple sources: ConfigService, process.env, and direct .env file read
    let secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY;
    
    // If still not found, try reading .env file directly (for cases where ConfigModule doesn't load it)
    if (!secretKey || secretKey === 'sk_test_your_stripe_secret_key_here') {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const match = envContent.match(/STRIPE_SECRET_KEY=(.+)/);
          if (match && match[1]) {
            secretKey = match[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
          }
        }
      } catch (e) {
        // Ignore errors reading .env file
      }
    }
    
    if (secretKey && secretKey !== 'sk_test_your_stripe_secret_key_here') {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    }
    // If no key is set, stripe will be undefined and methods will throw appropriate errors
  }

  async createPaymentIntent(amount: number, orderId: number, metadata?: Record<string, string>) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }
    
    try {
      // Check if order exists first
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      
      if (!order) {
        throw new BadRequestException(`Order with ID ${orderId} not found`);
      }
      
      // Convert amount to cents (Stripe uses smallest currency unit)
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'eur',
        metadata: {
          orderId: orderId.toString(),
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Update order with payment intent ID
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentIntentId: paymentIntent.id,
          paymentStatus: 'pending',
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update order status
        const order = await this.prisma.order.findUnique({
          where: { paymentIntentId },
        });

        if (order) {
          await this.prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'succeeded',
              status: 'confirmed',
            },
          });
        }

        return { success: true, orderId: order?.id };
      }

      return { success: false, status: paymentIntent.status };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  async handleWebhook(signature: string, body: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      const order = await this.prisma.order.findUnique({
        where: { paymentIntentId: paymentIntent.id },
      });

      if (order) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'succeeded',
            status: 'confirmed',
          },
        });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      const order = await this.prisma.order.findUnique({
        where: { paymentIntentId: paymentIntent.id },
      });

      if (order) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'failed',
          },
        });
      }
    }

    return { received: true };
  }
}
