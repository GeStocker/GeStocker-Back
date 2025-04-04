// trial.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Between } from 'typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  PurchaseLog,
  PaymentStatus,
  PaymentMethod,
} from '../payments/entities/payment.entity';
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
  ) {}

  @Cron('*0 0 0 * * *')
  async handleExpiredTrials() {
    const expiredTrials = await this.purchaseLogRepository.find({
      where: {
        status: PaymentStatus.TRIAL,
        expirationDate: LessThanOrEqual(new Date()),
      },
      relations: ['user'],
    });
    console.log(expiredTrials);

    for (const trial of expiredTrials) {
      const user = trial.user;
      user.isActive = false;
      trial.status = PaymentStatus.PENDING;
      await this.userRepository.save(user);
      const priceId = this.configService.get('STRIPE_BASIC_PRICE_ID');
      const session = await this.stripeService.createCheckoutSession(
        priceId,
        user.id,
      );
      trial.stripeSessionId = session.id;
      trial.amount = (session.amount_total ?? 0) / 100,
      trial.paymentMethod = PaymentMethod.CARD;
      await this.purchaseLogRepository.save(trial);
      await sendEmail(
        user.email,
        'Tu prueba gratuita ha terminado',
        'trialWarning',
        {
          name: user.name,
          checkoutUrl: session.url ?? '',
        },
      );
    }
  }

  @Cron('0 0 0 */2 * *')
  async sendTrialReminders() {
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const expiringTrials = await this.purchaseLogRepository.find({
        where: {
          status: PaymentStatus.TRIAL,
          expirationDate: LessThanOrEqual(threeDaysFromNow),
        },
        relations: ['user'],
      });

      for (const trial of expiringTrials) {
        try {
          await sendEmail(
            trial.user.email,
            'Tu prueba gratuita está por terminar',
            'trialWarning',
            {
              name: trial.user.name,
              expirationDate: trial.expirationDate.toISOString(),
            },
          );
        } catch (emailError) {
          console.error(emailError);
        }
      }
    } catch (dbError) {}
  }
}
