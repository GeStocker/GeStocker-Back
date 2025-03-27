import { Module } from '@nestjs/common';
import { InventoryProductsService } from './inventory-products.service';
import { InventoryProductsController } from './inventory-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryProduct } from './entities/inventory-products.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../products/entities/product.entity';
import { SalesOrder } from '../sales-order/entities/sales-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryProduct, Inventory, Product, SalesOrder])],
  controllers: [InventoryProductsController],
  providers: [InventoryProductsService],
})
export class InventoryProductsModule {}
