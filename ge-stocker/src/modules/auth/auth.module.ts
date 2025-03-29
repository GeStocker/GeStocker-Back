import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './authGoogle.startegy';
import { PaymentSession } from '../payments/entities/payment-session-entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PaymentSession, Payment]),
    PassportModule.register({ defaultStrategy: 'google' }), 
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, PaymentsService],
})
export class AuthModule {}