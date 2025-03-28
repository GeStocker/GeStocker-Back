import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesProductModule } from './modules/categories-product/categories-product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { BussinesModule } from './modules/bussines/bussines.module';
import { TypeOrmConfig } from './config/typeORM.config';
import { EnvConfig } from './config/env.config';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from './modules/files/files.module';
import { InventoryProductsModule } from './modules/inventory-products/inventory-products.module';
import { IncomingShipmentModule } from './modules/incoming-shipment/incoming-shipment.module';
import { CollaboratorsModule } from './modules/collaborators/collaborators.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SalesOrderModule } from './modules/sales-order/sales-order.module';
import { OutgoingProductModule } from './modules/outgoing-product/outgoing-product.module';
import { LostProductsModule } from './modules/lost-products/lost-products.module';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [
    MulterModule.register({
      dest: './uploads'}),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRETS,
      signOptions: {expiresIn: "1h"}
    }),
    TypeOrmConfig,
    EnvConfig,
    CategoriesProductModule, 
    ProductsModule, 
    InventoryModule, 
    UsersModule, 
    AuthModule, 
    BussinesModule,
    InventoryProductsModule,
    FilesModule,
    IncomingShipmentModule,
    CollaboratorsModule,
    PaymentsModule,
    SalesOrderModule,
    OutgoingProductModule,
    LostProductsModule
  ], 
  controllers: [],
  providers: [],
})
export class AppModule {}
