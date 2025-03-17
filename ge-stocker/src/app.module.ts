import { Module } from '@nestjs/common';
import { CategoriesBusinessModule } from './modules/categories-bussines/categories-business.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesProductModule } from './modules/categories-product/categories-product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { BussinesModule } from './modules/bussines/bussines.module';


@Module({
  imports: [CategoriesBusinessModule, CategoriesProductModule, ProductsModule, InventoryModule, UsersModule, AuthModule, BussinesModule], 
  controllers: [],
  providers: [],
})
export class AppModule {}
