import { Module } from '@nestjs/common';
import { InventoryProductsService } from './inventory-products.service';
import { InventoryProductsController } from './inventory-products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryProduct } from './entities/inventory-products.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Product } from '../products/entities/product.entity';
import { SalesOrder } from '../sales-order/entities/sales-order.entity';
import { User } from '../users/entities/user.entity';
import { ExcelInventoryImportController } from './import-excel-inventoryProducts.controller';
import { ExcelImportInventoryService } from './import-excel-inventoryProducts.service';
import { ProductsModule } from '../products/products.module';
import { IncomingShipmentService } from '../incoming-shipment/incoming-shipment.service';
import { IncomingShipmentController } from '../incoming-shipment/incoming-shipment.controller';
import { IncomingShipment } from '../incoming-shipment/entities/incoming-shipment.entity';
import { IncomingShipmentModule } from '../incoming-shipment/incoming-shipment.module';
import { Collaborator } from '../collaborators/entities/collaborator.entity';
import { ExportInventoryController } from './export-inventory.controller';
import { ExcelExportInventoryService } from './export-excel-inventory.service';
import { IncomingProduct } from '../incoming-shipment/entities/incoming-products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryProduct, Inventory, Product, SalesOrder, User, IncomingShipment, Collaborator, IncomingProduct]),
ProductsModule,
IncomingShipmentModule],
  controllers: [InventoryProductsController, ExcelInventoryImportController, IncomingShipmentController, ExportInventoryController],
  providers: [InventoryProductsService, ExcelImportInventoryService, ExcelExportInventoryService], 
})
export class InventoryProductsModule {}
