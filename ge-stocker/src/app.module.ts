import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesProductModule } from './modules/categories-product/categories-product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { BussinesModule } from './modules/bussines/bussines.module';
import { RolesModule } from './modules/roles/roles.module';
import { TypeOrmConfig } from './config/typeORM.config';
import { EnvConfig } from './config/env.config';
import { JwtModule } from '@nestjs/jwt';
import { InventoryProductsModule } from './modules/inventory-products/inventory-products.module';


@Module({
  imports: [
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
    RolesModule,
    InventoryProductsModule
  ], 
  controllers: [],
  providers: [],
})
export class AppModule {}
