import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Business } from '../bussines/entities/bussines.entity';
import { IncomingShipment } from '../incoming-shipment/entities/incoming-shipment.entity';
import { SalesOrder } from '../sales-order/entities/sales-order.entity';
import { User } from '../users/entities/user.entity';
import { Collaborator } from '../collaborators/entities/collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Business, IncomingShipment, SalesOrder, User, Collaborator])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
