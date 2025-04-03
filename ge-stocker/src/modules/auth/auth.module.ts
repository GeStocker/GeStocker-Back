import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './authGoogle.startegy';
import { StripeService } from '../payments/stripe.service';
import { PurchasesService } from '../payments/payments.service';
import { PurchaseLog } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PurchaseLog]),
    PassportModule.register({ defaultStrategy: 'google' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    StripeService,
    PurchasesService,
  ],
})
export class AuthModule {}