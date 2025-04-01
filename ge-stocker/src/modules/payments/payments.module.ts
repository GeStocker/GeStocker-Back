import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PurchasesController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PurchaseLog } from './entities/payment.entity';
import { PurchasesService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, PurchaseLog])],
  controllers: [PurchasesController],
  providers: [StripeService, PurchasesService],
})
export class PaymentsModule {}