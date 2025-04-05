import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../bussines/entities/bussines.entity';
import { Product } from '../products/entities/product.entity';
import { PurchaseLog } from '../payments/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Business, Product, PurchaseLog])],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
