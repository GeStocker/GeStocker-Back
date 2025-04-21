import { Module } from '@nestjs/common';
import { SalesOrderService } from './sales-order.service';
import { SalesOrderController } from './sales-order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrder } from './entities/sales-order.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryProduct } from '../inventory-products/entities/inventory-products.entity';
import { OutgoingProduct } from '../outgoing-product/entities/outgoing-product.entity';
import { User } from '../users/entities/user.entity';
import { Collaborator } from '../collaborators/entities/collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, Inventory, InventoryProduct, OutgoingProduct, User, Collaborator])],
  controllers: [SalesOrderController],
  providers: [SalesOrderService],
})
export class SalesOrderModule {}
