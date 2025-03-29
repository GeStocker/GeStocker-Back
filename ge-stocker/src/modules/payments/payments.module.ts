import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { PaymentSession } from './entities/payment-session-entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Payment, PaymentSession])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}