import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  Headers,
  UseGuards, 
  BadRequestException
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard'; // Corregida la ruta
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto'; // Asegúrate de crear este archivo
import { EntityManager } from 'typeorm';

@Controller('payments')
export class PaymentsController {
  stripe: any;
  configService: any;
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

  // payments.controller.ts
@Post('webhook')
async handleWebhook(
  @Req() req: { rawBody: string }, // Usar el rawBody capturado
  @Headers('stripe-signature') signature: string
) {
  try {
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody, 
      signature,
      this.configService.get('STRIPE_WEBHOOK_SECRET')
    );

    await this.paymentsService.handleSuccessfulPayment(event);
    return { received: true };
  } catch (err) {
    console.error('❌ Error en webhook:', err.message);
    throw new BadRequestException(`Fallo en verificación: ${err.message}`);
  }
}
}