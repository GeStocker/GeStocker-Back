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
import { MetricsModule } from './modules/metrics/metrics.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { VerificationCodesModule } from './modules/verification-codes/verification-codes.module';
import { WebsocketModule } from './modules/websocket/websocket.module';


@Module({
  imports: [
    EnvConfig,
    MulterModule.register({
      dest: './uploads'}),
      JwtModule.register({
        global: true,
        secret: process.env.JWT_SECRET, // Nombre corregido
        signOptions: { expiresIn: "12h" }
      }),
    ScheduleModule.forRoot(),
    TypeOrmConfig,
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
    LostProductsModule,
    MetricsModule,
    SuperAdminModule,
    VerificationCodesModule,
    WebsocketModule,
  ], 
  controllers: [],
  providers: [],
})
export class AppModule {}
