import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesProduct } from '../categories-product/entities/categories-product.entity';
import { Repository } from 'typeorm';
import { preload } from 'src/helpers/preload';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  createProduct(createProductDto: CreateProductDto, userId: string) {
    return 'This action adds a new product';
  }


  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
