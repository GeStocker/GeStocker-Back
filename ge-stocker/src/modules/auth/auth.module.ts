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
import { PasswordResetToken } from '../verification-codes/entities/verification-code.entity';
import { VerificationCodesService } from '../verification-codes/verification-codes.service';
import { PasswordResetGuard } from './password-reset.guard';
import { Collaborator } from '../collaborators/entities/collaborator.entity';
import { Business } from '../bussines/entities/bussines.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PurchaseLog, PasswordResetToken, Collaborator, Business]),
    PassportModule.register({ defaultStrategy: 'google' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    StripeService,
    PurchasesService,
    VerificationCodesService,
    PasswordResetGuard
  ],
})
export class AuthModule {}