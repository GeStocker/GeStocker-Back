import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { SubscriptionPlan, SubscriptionStatus } from '../../interfaces/subscriptions.enum';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

interface StripeConfiguration {
  stripe: {
    secretKey: string;
    webhookSecret: string;
    successUrl: string;
    cancelUrl: string;
    prices: {
      basic: string;
      professional: string;
      enterprise: string;
    };
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly configService: ConfigService<StripeConfiguration>,
  ) {
    const stripeConfig = this.configService.get('stripe');
    
    if (!stripeConfig?.secretKey) {
      throw new Error('Stripe secret key not configured');
    }

    this.stripe = new Stripe(stripeConfig.secretKey, {
      typescript: true,
    });
  }

  async createCustomer(name: string, email: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        name,
        email,
      });
      return customer.id;
    } catch (error) {
      this.logger.error(`Error creating Stripe customer: ${error.message}`);
      throw new Error('Failed to create Stripe customer');
    }
  }

  async createCheckoutSession(user: User, priceId: string) {
    try {
      if (!user.stripeCustomerId) {
        user.stripeCustomerId = await this.createCustomer(user.name, user.email);
        await this.usersRepository.save(user);
      }

      const stripeConfig = this.configService.get('stripe');

      return this.stripe.checkout.sessions.create({
        customer: user.stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${stripeConfig.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: stripeConfig.cancelUrl,
      });
    } catch (error) {
      this.logger.error(`Checkout session creation failed: ${error.message}`);
      throw new Error('Failed to create checkout session');
    }
  }

  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event);
          break;
        case 'invoice.payment_succeeded':
          await this.handleSuccessfulPayment(event);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSuccess(event);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Webhook handler error: ${error.message}`);
      throw error;
    }
  }

  private async handleSubscriptionUpdate(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const user = await this.usersRepository.findOneBy({
      stripeCustomerId: subscription.customer as string
    });

    if (!user) {
      this.logger.warn(`User not found for customer ID: ${subscription.customer}`);
      return;
    }

    const priceId = subscription.items.data[0].price.id;
    const planMapping = this.getPlanMapping();

    if (!planMapping[priceId]) {
      this.logger.warn(`Unrecognized price ID: ${priceId} for user ${user.id}`);
    }

    user.subscriptionPlan = planMapping[priceId] ?? null;
    user.subscriptionStatus = this.getValidStatus(subscription.status);
    user.currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    await this.usersRepository.save(user);
  }

  private async handleSubscriptionCancellation(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const user = await this.usersRepository.findOneBy({
      stripeCustomerId: subscription.customer as string
    });

    if (!user) {
      this.logger.warn(`User not found for customer ID: ${subscription.customer}`);
      return;
    }

    user.subscriptionStatus = SubscriptionStatus.CANCELED;
    user.subscriptionPlan = undefined;
    user.currentPeriodEnd = undefined;

    await this.usersRepository.save(user);
  }

  private async handleSuccessfulPayment(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const user = await this.usersRepository.findOneBy({
      stripeCustomerId: invoice.customer as string
    });

    if (user && invoice.payment_intent) {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        invoice.payment_intent as string
      );

      await this.createPaymentRecord({
        user,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        stripePaymentId: paymentIntent.id,
        invoiceUrl: invoice.hosted_invoice_url ?? undefined,
        plan: user.subscriptionPlan ?? SubscriptionPlan.BASIC
      });
    }
  }

  private async handlePaymentIntentSuccess(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const user = await this.usersRepository.findOneBy({
      stripeCustomerId: paymentIntent.customer as string
    });

    if (user) {
      await this.createPaymentRecord({
        user,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        stripePaymentId: paymentIntent.id,
        plan: user.subscriptionPlan ?? SubscriptionPlan.BASIC
      });
    }
  }

  private async createPaymentRecord(data: {
    user: User;
    amount: number;
    currency: string;
    status: string;
    stripePaymentId: string;
    invoiceUrl?: string;
    plan: SubscriptionPlan;
  }) {
    const payment = this.paymentsRepository.create({
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      stripePaymentId: data.stripePaymentId,
      invoiceUrl: data.invoiceUrl,
      plan: data.plan,
      user: data.user
    });

    await this.paymentsRepository.save(payment);
    this.logger.log(`Payment ${data.stripePaymentId} recorded for user ${data.user.id}`);
  }

  private getPlanMapping(): Record<string, SubscriptionPlan> {
    const stripeConfig = this.configService.get('stripe');
    return {
      [stripeConfig.prices.basic]: SubscriptionPlan.BASIC,
      [stripeConfig.prices.professional]: SubscriptionPlan.PROFESSIONAL,
      [stripeConfig.prices.enterprise]: SubscriptionPlan.ENTERPRISE,
    };
  }

  private getValidStatus(status: string): SubscriptionStatus {
    const isValidStatus = (s: string): s is SubscriptionStatus => 
      Object.values(SubscriptionStatus).includes(s as SubscriptionStatus);
    
    return isValidStatus(status) ? status as SubscriptionStatus : SubscriptionStatus.INCOMPLETE;
  }
}