import { Module } from '@nestjs/common';
import { CategoriesProductService } from './categories-product.service';
import { CategoriesProductController } from './categories-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesProduct } from './entities/categories-product.entity';
import { Business } from '../bussines/entities/bussines.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesProduct, Business])],
  controllers: [CategoriesProductController],
  providers: [CategoriesProductService],
})
export class CategoriesProductModule {}
