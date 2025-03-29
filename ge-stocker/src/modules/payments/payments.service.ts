// src/modules/payments/payments.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { PaymentSession } from './entities/payment-session-entity';
import { SubscriptionPlan } from '../../interfaces/subscriptions.enum';
import { UserRole } from 'src/interfaces/roles.enum';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(PaymentSession)
        private paymentSessionRepository: Repository<PaymentSession>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        this.stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-02-24.acacia'
        });
    }

    getPriceIdForPlan(plan: SubscriptionPlan): string {
        const prices = {
            [SubscriptionPlan.BASIC]: this.configService.get('STRIPE_BASIC_PRICE_ID'),
            [SubscriptionPlan.PROFESIONAL]: this.configService.get('STRIPE_PROFESSIONAL_PRICE_ID'),
            [SubscriptionPlan.BUSINESS]: this.configService.get('STRIPE_BUSINESS_PRICE_ID'),
        };
        if (!prices[plan]) {
            throw new NotFoundException(`Price ID not found for plan: ${plan}`);
        }
        return prices[plan];
    }

    async createCheckoutSession(
        priceId: string,
        plan: SubscriptionPlan,
        userId: string,
        manager: EntityManager,
    ): Promise<{ url: string }> {
        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{ price: priceId, quantity: 1 }],
                mode: 'subscription',
                metadata: { userId, plan },
                success_url: `${this.configService.get('FRONTEND_URL')}/payment-success?token={CHECKOUT_SESSION_ID}`,
                cancel_url: `${this.configService.get('FRONTEND_URL')}/payment-cancel`,
            });

            await manager.save(PaymentSession, {
                sessionId: session.id,
                user: { id: userId },
                status: 'PENDING',
            });

            if (!session.url) {
                throw new InternalServerErrorException('Failed to create Stripe checkout session');
            }

            return { url: session.url };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to create checkout session: ${error.message}`);
        }
    }

    async handleStripeWebhook(payload: any, sig: string) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
        } catch (err) {
            throw new InternalServerErrorException(`Webhook signature verification failed: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            await this.handleSuccessfulPayment(event);
        }

        return { received: true };
    }

    private async handleSuccessfulPayment(event: Stripe.Event) {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.metadata || !session.metadata.userId || !session.metadata.plan) {
            throw new Error('Missing metadata in Stripe session');
        }

        const { userId, plan } = session.metadata;

        return this.userRepository.manager.transaction(async (manager) => {
            
            await manager.update(
                User,
                userId,
                {
                    roles: [plan as UserRole],
                    isActive: true,
                }
            );

            await manager.update(
                PaymentSession,
                { sessionId: session.id },
                { status: 'COMPLETED' }
            );

            const payment = this.paymentRepository.create({
                amount: (session.amount_total ?? 0) / 100,
                currency: session.currency ?? 'usd',
                status: 'succeeded',
                stripePaymentId: session.id,
                plan: session.metadata?.plan as SubscriptionPlan,
                user: { id: session.metadata?.userId ?? '' },
            });

            await manager.save(Payment, payment);
        });
    }
}