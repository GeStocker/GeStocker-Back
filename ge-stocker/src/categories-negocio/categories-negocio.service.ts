import { Injectable } from '@nestjs/common';
import { CreateCategoriesNegocioDto } from './dto/create-categories-negocio.dto';
import { UpdateCategoriesNegocioDto } from './dto/update-categories-negocio.dto';

@Injectable()
export class CategoriesNegocioService {
  create(createCategoriesNegocioDto: CreateCategoriesNegocioDto) {
    return 'This action adds a new categoriesNegocio';
  }

  findAll() {
    return `This action returns all categoriesNegocio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoriesNegocio`;
  }

  update(id: number, updateCategoriesNegocioDto: UpdateCategoriesNegocioDto) {
    return `This action updates a #${id} categoriesNegocio`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoriesNegocio`;
  }
}
