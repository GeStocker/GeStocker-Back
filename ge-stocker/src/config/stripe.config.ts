import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.development' });

export interface StripeConfig {
    secretKey: string;
    webhookSecret: string;
    successUrl: string;
    cancelUrl: string;
    prices: {
        basic: string;
        professional: string;
        enterprise: string;
    };
}

export const stripeConfig: StripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    successUrl: process.env.FRONTEND_SUCCESS_URL!,
    cancelUrl: process.env.FRONTEND_CANCEL_URL!,
    prices: {
        basic: process.env.STRIPE_BASIC_PRICE!,
        professional: process.env.STRIPE_PROFESSIONAL_PRICE!,
        enterprise: process.env.STRIPE_ENTERPRISE_PRICE!,
    }
};