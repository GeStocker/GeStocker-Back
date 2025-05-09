import { Module } from '@nestjs/common';
import { IncomingShipmentService } from './incoming-shipment.service';
import { IncomingShipmentController } from './incoming-shipment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomingShipment } from './entities/incoming-shipment.entity';
import { IncomingProduct } from './entities/incoming-products.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';
import { User } from '../users/entities/user.entity';
import { Collaborator } from '../collaborators/entities/collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IncomingShipment, IncomingProduct, Product, Inventory, InventoryProduct, User, Collaborator])],
  controllers: [IncomingShipmentController],
  providers: [IncomingShipmentService],
  exports: [IncomingShipmentService],
})
export class IncomingShipmentModule {}
