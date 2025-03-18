import { Module } from '@nestjs/common';
import { InventoryProductsService } from './inventory-products.service';
import { InventoryProductsController } from './inventory-products.controller';

@Module({
  controllers: [InventoryProductsController],
  providers: [InventoryProductsService],
})
export class InventoryProductsModule {}
