// trial.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Between } from 'typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { PurchaseLog, PaymentStatus, PaymentMethod } from '../payments/entities/payment.entity';
import { StripeService } from '../payments/stripe.service';
import { ConfigService } from '@nestjs/config';
import { sendEmail } from 'src/emails/config/mailer';

@Injectable()
export class TrialService {
    constructor(
        @InjectRepository(PurchaseLog)
        private purchaseLogRepository: Repository<PurchaseLog>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private stripeService: StripeService,
        private configService: ConfigService,
    ) { }

    @Cron('*/1 * * * *')
    async handleExpiredTrials() {
        const expiredTrials = await this.purchaseLogRepository.find({
            where: {
                status: PaymentStatus.TRIAL,
                expirationDate: LessThanOrEqual(new Date()),
            },
            relations: ['user'],
        });

        for (const trial of expiredTrials) {
            const user = trial.user;
            user.isActive = false;
            await this.userRepository.save(user);

            const priceId = this.configService.get('STRIPE_BASIC_PRICE_ID');
            const session = await this.stripeService.createCheckoutSession(
                priceId,
                user.id
            );

            const pendingPurchase = this.purchaseLogRepository.create({
                user,
                amount: (session.amount_total ?? 0) / 100,
                paymentMethod: PaymentMethod.CARD,
                status: PaymentStatus.PENDING,
                stripeSessionId: session.id,
            });

            await this.purchaseLogRepository.save(pendingPurchase);

            await sendEmail(
                user.email,
                'Tu prueba gratuita ha terminado',
                'trialWarning',
                {
                    name: user.name,
                    checkoutUrl: session.url ?? ''
                }
            );
        }
    }

    @Cron('*/10 * * * * *') // Cada minuto para pruebas
async sendTrialReminders() {

    try {
        const expiringTrials = await this.purchaseLogRepository.find({
            where: {
                status: PaymentStatus.TRIAL,
                expirationDate: LessThanOrEqual(new Date()),
            },
            relations: ['user'],
        });

        console.log(expiringTrials)

        console.log(`Encontrados ${expiringTrials.length} trials próximos a expirar`);

        for (const trial of expiringTrials) {
            console.log(`Enviando email a: ${trial.user.email}`);
            try {
                await sendEmail(
                    trial.user.email,
                    'Tu prueba gratuita está por terminar',
                    'trialWarning',
                    {
                        name: trial.user.name,
                        expirationDate: trial.expirationDate.toISOString(),
                    }
                );
                console.log(`Email enviado exitosamente a ${trial.user.email}`);
            } catch (emailError) {
                console.error(`Error enviando email a ${trial.user.email}:`, emailError);
            }
        }
    } catch (dbError) {
        console.error('Error en consulta a la base de datos:', dbError);
    }
}
}