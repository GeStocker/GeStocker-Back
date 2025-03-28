import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { Not, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
        private configService: ConfigService,
    ) {

    const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey){
        throw new Error ('STRIPE_SECRET_KEY no esta definida')
    }

    this.stripe = new Stripe((stripeSecretKey), {apiVersion: '2025-02-24.acacia'});
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
            success_url: `${this.configService.get('FRONTEND_SUCCESS_URL')}?session_id={{CHECKOUT_SESSION_ID}}`,
            cancel_url: this.configService.get('FRONTEND_CANCEL_URL'), // falta definir la ruta de cancelación de supscripción
        });

        return { url: session.url };
    }

    async handleWebhook(payload: any, sig: string) {
        const stripeSecretKey = this.configService.get('STRIPE_WEBHOOK_SECRET');
        const event = this.stripe.webhooks.constructEvent(
            payload,
            sig,
            stripeSecretKey
        );

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
    
        const payment = this.paymentsRepository.create({
            amount: session.amount_total / 100,
            currency: session.currency,
            status: 'succeeded',
            stripePaymentId: session.id,
            user: { id: session.metadata.userId }
        });
    
        await this.paymentsRepository.save(payment);
    }

        return {received:true};
    }
}