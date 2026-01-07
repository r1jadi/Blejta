import { Controller, Post, Body, Headers, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createPaymentIntent(@Body() body: { amount: number; orderId: number }) {
    const { amount, orderId } = body;
    
    if (!amount || !orderId) {
      throw new BadRequestException('Amount and orderId are required');
    }

    return this.paymentsService.createPaymentIntent(amount, orderId);
  }

  @Post('confirm')
  async confirmPayment(@Body() body: { paymentIntentId: string }) {
    const { paymentIntentId } = body;
    
    if (!paymentIntentId) {
      throw new BadRequestException('paymentIntentId is required');
    }

    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Get raw body buffer and convert to string
    const rawBody = req.rawBody || req.body;
    
    if (!rawBody) {
      throw new BadRequestException('Raw body is required for webhook verification');
    }

    const bodyString = Buffer.isBuffer(rawBody) 
      ? rawBody.toString('utf8') 
      : typeof rawBody === 'string' 
        ? rawBody 
        : JSON.stringify(rawBody);

    return this.paymentsService.handleWebhook(signature, bodyString);
  }
}
