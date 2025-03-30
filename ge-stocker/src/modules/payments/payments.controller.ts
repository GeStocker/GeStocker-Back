// src/payments/purchases.controller.ts
import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PurchasesService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('purchases')
export class PurchasesController {
  constructor(
    private stripeService: StripeService,
    private purchasesService: PurchasesService,
  ) {}

  @Post('subscribe/:priceId')
  @UseGuards(AuthGuard)
  async createSubscription(
    @Param('priceId') priceId: string,
    @Request() req,
  ) {
    const session = await this.stripeService.createCheckoutSession(priceId, req.user.id);
    await this.purchasesService.createPendingPurchase(
      req.user.id,
      (session.amount_total ?? 0) / 100,
      session.id
    );
    return { url: session.url };
  }

  @Post('success/:sessionId')
  async handleSuccess(@Param('sessionId') sessionId: string) {
    return this.purchasesService.completePurchase(sessionId);
  }
}