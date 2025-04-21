import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from '../bussines/entities/bussines.entity';
import { CategoriesProduct } from '../categories-product/entities/categories-product.entity';
import { FilesService } from '../files/files.service';
import { Product } from './entities/product.entity';
import { CloudinaryRepository } from '../files/files.repository';
import { User } from '../users/entities/user.entity';
import { ExcelImportController } from './excel-import.controller';
import { ExcelImportService } from './excel-import.service';
import { Collaborator } from '../collaborators/entities/collaborator.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product,Business, CategoriesProduct, User, Collaborator])],
  controllers: [ProductsController, ExcelImportController],
  providers: [ProductsService, FilesService, CloudinaryRepository, ExcelImportService],
  exports: [ProductsService],
})
export class ProductsModule {}
