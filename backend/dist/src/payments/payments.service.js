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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const prisma_service_1 = require("../prisma.service");
let PaymentsService = class PaymentsService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        let secretKey = this.configService.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY;
        if (!secretKey || secretKey === 'sk_test_your_stripe_secret_key_here') {
            try {
                const fs = require('fs');
                const path = require('path');
                const envPath = path.join(process.cwd(), '.env');
                if (fs.existsSync(envPath)) {
                    const envContent = fs.readFileSync(envPath, 'utf8');
                    const match = envContent.match(/STRIPE_SECRET_KEY=(.+)/);
                    if (match && match[1]) {
                        secretKey = match[1].trim().replace(/^["']|["']$/g, '');
                    }
                }
            }
            catch (e) {
            }
        }
        if (secretKey && secretKey !== 'sk_test_your_stripe_secret_key_here') {
            this.stripe = new stripe_1.default(secretKey, {
                apiVersion: '2023-10-16',
            });
        }
    }
    async createPaymentIntent(amount, orderId, metadata) {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
        }
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
            });
            if (!order) {
                throw new common_1.BadRequestException(`Order with ID ${orderId} not found`);
            }
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
        }
        catch (error) {
            console.error('Error creating payment intent:', error);
            throw new common_1.BadRequestException('Failed to create payment intent');
        }
    }
    async confirmPayment(paymentIntentId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status === 'succeeded') {
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
        }
        catch (error) {
            console.error('Error confirming payment:', error);
            throw new common_1.BadRequestException('Failed to confirm payment');
        }
    }
    async handleWebhook(signature, body) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
        }
        catch (err) {
            console.error('Webhook signature verification failed:', err);
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
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
        }
        else if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object;
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map