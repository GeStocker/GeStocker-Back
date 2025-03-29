import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  Headers,
  UseGuards 
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard'; // Corregida la ruta
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto'; // Asegúrate de crear este archivo
import { EntityManager } from 'typeorm';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly entityManager: EntityManager
  ) {}

  @Post('create-checkout-session')
  @UseGuards(AuthGuard)
  async createCheckoutSession(
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
    @Req() req // Corregido @Red() por @Req()
  ) {
    return this.paymentsService.createCheckoutSession(
      createCheckoutSessionDto.priceId, // Corregido priceld -> priceId
      createCheckoutSessionDto.plan,
      req.user.id,
      this.entityManager
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Body() rawBody: Buffer,
    @Headers('stripe-signature') signature: string
  ) {
    return this.paymentsService.handleStripeWebhook(rawBody, signature);
  }
}