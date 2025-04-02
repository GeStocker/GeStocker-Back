import { Module } from '@nestjs/common';
import { CategoriesProductService } from './categories-product.service';
import { CategoriesProductController } from './categories-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesProduct } from './entities/categories-product.entity';
import { Business } from '../bussines/entities/bussines.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesProduct, Business, User])],
  controllers: [CategoriesProductController],
  providers: [CategoriesProductService],
})
export class CategoriesProductModule {}
