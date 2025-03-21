import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../bussines/entities/bussines.entity';
import { CategoriesProduct } from '../categories-product/entities/categories-product.entity';
import { FilesService } from '../files/files.service';
import { Product } from './entities/product.entity';
import { CloudinaryRepository } from '../files/files.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product,Business, CategoriesProduct])],
  controllers: [ProductsController],
  providers: [ProductsService, FilesService, CloudinaryRepository],
})
export class ProductsModule {}
