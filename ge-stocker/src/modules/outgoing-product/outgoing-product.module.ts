import { Module } from '@nestjs/common';
import { OutgoingProductService } from './outgoing-product.service';
import { OutgoingProductController } from './outgoing-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutgoingProduct } from './entities/outgoing-product.entity';
import { SalesOrder } from '../sales-order/entities/sales-order.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OutgoingProduct, SalesOrder, Inventory, InventoryProduct])],
  controllers: [OutgoingProductController],
  providers: [OutgoingProductService],
})
export class OutgoingProductModule {}
