import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Business } from '../bussines/entities/bussines.entity';
import { IncomingShipment } from '../incoming-shipment/entities/incoming-shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Business, IncomingShipment])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
