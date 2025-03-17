import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesNegocioService } from './categories-negocio.service';
import { CreateCategoriesNegocioDto } from './dto/create-categories-negocio.dto';
import { UpdateCategoriesNegocioDto } from './dto/update-categories-negocio.dto';

@Controller('categories-negocio')
export class CategoriesNegocioController {
  constructor(private readonly categoriesNegocioService: CategoriesNegocioService) {}

  @Post()
  create(@Body() createCategoriesNegocioDto: CreateCategoriesNegocioDto) {
    return this.categoriesNegocioService.create(createCategoriesNegocioDto);
  }

  @Get()
  findAll() {
    return this.categoriesNegocioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesNegocioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriesNegocioDto: UpdateCategoriesNegocioDto) {
    return this.categoriesNegocioService.update(+id, updateCategoriesNegocioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesNegocioService.remove(+id);
  }
}
