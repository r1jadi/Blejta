import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
export declare class PaymentsService {
    private configService;
    private prisma;
    private stripe;
    constructor(configService: ConfigService, prisma: PrismaService);
    createPaymentIntent(amount: number, orderId: number, metadata?: Record<string, string>): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    confirmPayment(paymentIntentId: string): Promise<{
        success: boolean;
        orderId: number;
        status?: undefined;
    } | {
        success: boolean;
        status: "canceled" | "processing" | "requires_action" | "requires_capture" | "requires_confirmation" | "requires_payment_method";
        orderId?: undefined;
    }>;
    handleWebhook(signature: string, body: string): Promise<{
        received: boolean;
    }>;
}
