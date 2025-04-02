import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrder } from '../sales-order/entities/sales-order.entity';
import { IncomingShipment } from '../incoming-shipment/entities/incoming-shipment.entity';
import { LostProducts } from '../lost-products/entities/lost-product.entity';
import { Business } from '../bussines/entities/bussines.entity';
import { User } from '../users/entities/user.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, IncomingShipment, LostProducts, Business, User, InventoryProduct])],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
