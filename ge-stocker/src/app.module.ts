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


@Module({
  imports: [
    TypeOrmConfig,
    EnvConfig,
    CategoriesProductModule, 
    ProductsModule, 
    InventoryModule, 
    UsersModule, 
    AuthModule, 
    BussinesModule, 
    RolesModule
  ], 
  controllers: [],
  providers: [],
})
export class AppModule {}
