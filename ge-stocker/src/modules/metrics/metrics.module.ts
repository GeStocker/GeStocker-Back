import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrder } from '../sales-order/entities/sales-order.entity';
import { IncomingShipment } from '../incoming-shipment/entities/incoming-shipment.entity';
import { LostProducts } from '../lost-products/entities/lost-product.entity';
import { Business } from '../bussines/entities/bussines.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, IncomingShipment, LostProducts, Business])],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
