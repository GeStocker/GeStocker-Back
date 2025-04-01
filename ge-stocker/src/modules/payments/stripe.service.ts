import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity'
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private configService: ConfigService,
    ) {

        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');

        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY no esta definida')
        }

        this.stripe = new Stripe((stripeSecretKey), { apiVersion: '2025-02-24.acacia' });
    }

    async createCheckoutSession(priceId: string, userId: string) {
        const user = await this.usersRepository.findOneBy({ id: userId });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${this.configService.get('FRONTEND_SUCCESS_URL')}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: this.configService.get('FRONTEND_CANCEL_URL'),
        });

        return session
    }

    async getCheckoutSessionUrl(sessionId: string) {
        const session = await this.retrieveCheckoutSession(sessionId);
        return session.url;
    }

    async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
        return this.stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items.data.price.product']
        });
    }

    async updateSubscription(subscriptionId: string, newPriceId: string) {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        
        return this.stripe.subscriptions.update(subscriptionId, {
            items: [{
                id: subscription.items.data[0].id,
                price: newPriceId,
            }],
            proration_behavior: 'create_prorations', // o 'none' según necesidades
            cancel_at_period_end: false
        });
    }

    async cancelSubscription(subscriptionId: string, immediate: boolean = true) {
        return this.stripe.subscriptions.cancel(subscriptionId, {
            invoice_now: immediate,
            prorate: immediate
        });
    }

    async getPriceAmount(priceId: string): Promise<number> {
        const price = await this.stripe.prices.retrieve(priceId);
        return price.unit_amount ? price.unit_amount / 100 : 0;
    }
}