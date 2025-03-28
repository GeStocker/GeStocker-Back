import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  Headers 
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  createCheckoutSession(@Body() body: { priceId: string, userId: string }) {
    return this.paymentsService.createCheckoutSession(body.priceId, body.userId);
  }

  @Post('webhook')
  handleWebhook(@Req() req, @Headers('stripe-signature') sig: string) {
    return this.paymentsService.handleWebhook(req.rawBody, sig);
  }
}