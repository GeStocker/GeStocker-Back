import { Injectable } from '@nestjs/common';
import { CreateCategoriesProductDto } from './dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from './dto/update-categories-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesProduct } from './entities/categories-product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesProductService {
  constructor(
    @InjectRepository(CategoriesProduct)
    private readonly categoriesProductRepository: Repository<CategoriesProduct>,
  ) {}
  async createCategory(createCategoriesProductDto: CreateCategoriesProductDto, businessId: string): Promise<CategoriesProduct> {
    const { name } = createCategoriesProductDto;
    const existingCategory = await this.categoriesProductRepository.findOne({
      where: { name, business: { id: businessId } },
    });

    if (existingCategory) return existingCategory;

    const category = this.categoriesProductRepository.create({ name, business: { id: businessId } });

    return await this.categoriesProductRepository.save(category);
  }

  async getAllCategories(businessId: string) {
    return await this.categoriesProductRepository.find({
      where: { business: { id: businessId } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} categoriesProduct`;
  }

  update(id: number, updateCategoriesProductDto: UpdateCategoriesProductDto) {
    return `This action updates a #${id} categoriesProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoriesProduct`;
  }
}
