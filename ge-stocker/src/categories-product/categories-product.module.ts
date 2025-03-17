import { Module } from '@nestjs/common';
import { CategoriesProductService } from './categories-product.service';
import { CategoriesProductController } from './categories-product.controller';

@Module({
  controllers: [CategoriesProductController],
  providers: [CategoriesProductService],
})
export class CategoriesProductModule {}
