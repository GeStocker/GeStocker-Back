import { Module } from '@nestjs/common';
import { LostProductsService } from './lost-products.service';
import { LostProductsController } from './lost-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostProducts } from './entities/lost-product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';
import { IncomingProduct } from '../incoming-shipment/entities/incoming-products.entity';
import { OutgoingProduct } from '../outgoing-product/entities/outgoing-product.entity';
import { User } from '../users/entities/user.entity';
import { Collaborator } from '../collaborators/entities/collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LostProducts, Inventory, InventoryProduct, IncomingProduct, OutgoingProduct, User, Collaborator])],
  controllers: [LostProductsController],
  providers: [LostProductsService],
})
export class LostProductsModule {}
