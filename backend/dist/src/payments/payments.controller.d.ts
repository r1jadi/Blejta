import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPaymentIntent(body: {
        amount: number;
        orderId: number;
    }): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    confirmPayment(body: {
        paymentIntentId: string;
    }): Promise<{
        success: boolean;
        orderId: number;
        status?: undefined;
    } | {
        success: boolean;
        status: "canceled" | "processing" | "requires_action" | "requires_capture" | "requires_confirmation" | "requires_payment_method";
        orderId?: undefined;
    }>;
    handleWebhook(signature: string, req: any): Promise<{
        received: boolean;
    }>;
}
