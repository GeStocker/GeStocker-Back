import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriesProductDto } from './dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from './dto/update-categories-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesProduct } from './entities/categories-product.entity';
import { ILike, Not, Repository } from 'typeorm';
import { Business } from '../bussines/entities/bussines.entity';

@Injectable()
export class CategoriesProductService {
  constructor(
    @InjectRepository(CategoriesProduct) private readonly categoriesProductRepository: Repository<CategoriesProduct>,
    @InjectRepository(Business) private readonly businessRepository: Repository<Business>
  ) {}
  async createCategory(
    createCategoriesProductDto: CreateCategoriesProductDto,
    businessId: string
  ): Promise<CategoriesProduct> {
    const { name } = createCategoriesProductDto;
  
    const businessExists = await this.businessRepository.existsBy({ id: businessId });
    if (!businessExists) {
      throw new NotFoundException(`Business with id ${businessId} not found`);
    }
  
    const existingCategory = await this.categoriesProductRepository.findOne({
      where: {
        name: ILike(name.trim()),
        business: { id: businessId }
      },
      relations: ['business']
    });
  
    if (existingCategory) {
      throw new NotFoundException(`Category with name ${name} already exists in business with id ${businessId}`);
    }
  
    const category = this.categoriesProductRepository.create({
      name,
      business: { id: businessId }
    });
  
    return this.categoriesProductRepository.save(category);
  }

  async getAllCategories(businessId: string) {
    return await this.categoriesProductRepository.find({
      where: { business: { id: businessId } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} categoriesProduct`;
  }

  async updateCategory(id: string, businessId: string, updateCategoriesProductDto: UpdateCategoriesProductDto) {
    const { name } = updateCategoriesProductDto;

    const category = await this.categoriesProductRepository.findOne({
      where: { id: id, business: { id: businessId } },
    })

    if (!category) throw new NotFoundException('Categoria no encontrada');

    if (name) {
      const existingCategory = await this.categoriesProductRepository.findOne({
        where: {
          name: ILike(name.trim()),
          business: { id: businessId},
          id: Not(id),
        },
      });

      if (existingCategory) throw new ConflictException(`Ya existe una categoria con el nombre "${name}" en este negocio.`)
    }

    category.name = name ?? category.name;

    return await this.categoriesProductRepository.save(category);
  }
}
