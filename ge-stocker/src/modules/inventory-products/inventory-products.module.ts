import { Module } from '@nestjs/common';
import { InventoryProductsService } from './inventory-products.service';
import { InventoryProductsController } from './inventory-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryProduct } from './entities/inventory-products.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryProduct, Inventory])],
  controllers: [InventoryProductsController],
  providers: [InventoryProductsService],
})
export class InventoryProductsModule {}
