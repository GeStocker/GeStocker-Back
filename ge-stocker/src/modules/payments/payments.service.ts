// src/modules/payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { PaymentSession } from './entities/payment-session-entity';
import { SubscriptionPlan } from '../../interfaces/subscriptions.enum';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        const stripeKey = this.configService.getOrThrow<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(stripeKey);

        console.log('✅ Stripe inicializado correctamente');
    }

    getPriceIdForPlan(plan: SubscriptionPlan): string {
        const prices = {
            [SubscriptionPlan.BASIC]: this.configService.get('STRIPE_BASIC_PRICE_ID'),
            [SubscriptionPlan.PROFESIONAL]: this.configService.get('STRIPE_PROFESSIONAL_PRICE_ID'),
            [SubscriptionPlan.BUSINESS]: this.configService.get('STRIPE_BUSINESS_PRICE_ID'),
        };
        return prices[plan];
    }

    async createCheckoutSession(
        priceId: string,
        plan: SubscriptionPlan,
        userId: string,
        manager: EntityManager,
    ): Promise<{ url: string }> {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            metadata: { userId, plan },
            success_url: `${this.configService.get('FRONTEND_URL')}/payment-success`,
            cancel_url: `${this.configService.get('FRONTEND_URL')}/payment-cancel`,
        });

        await manager.save(PaymentSession, {
            sessionId: session.id,
            user: { id: userId },
            status: 'PENDING',
        });

        if (!session.url) {
            throw new NotFoundException('Session URL is null');
        }
        return { url: session.url };
    }

    async handleStripeWebhook(payload: any, sig: string) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        const event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);

        if (event.type === 'checkout.session.completed') {
            await this.handleSuccessfulPayment(event);
        }

        return { received: true };
    }

    async handleSuccessfulPayment(event: Stripe.Event) {
        const session = event.data.object as Stripe.Checkout.Session;

        return this.userRepository.manager.transaction(async (manager) => {
            // Actualizar usuario
            await manager.update(
                User,
                session.metadata?.userId ?? '',
                {
                    roles: session.metadata ? [{ name: session.metadata.plan } as any] : [],
                    isActive: true,
                }
            );

            // Actualizar sesión de pago
            await manager.update(
                PaymentSession,
                { sessionId: session.id },
                { status: 'COMPLETED' }
            );

            // Registrar pago
            await manager.save(Payment, {
                amount: (session.amount_total ?? 0) / 100,
                currency: session.currency ?? undefined,
                status: 'succeeded',
                stripePaymentId: session.id,
                plan: session.metadata?.plan as SubscriptionPlan ?? null,
                user: { id: session.metadata?.userId ?? '' },
            });
        });
    }
}