import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriesProductService } from './categories-product.service';
import { CreateCategoriesProductDto } from './dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from './dto/update-categories-product.dto';

@Controller('categories-product')
export class CategoriesProductController {
  constructor(private readonly categoriesProductService: CategoriesProductService) {}

  @Post()
  create(@Body() createCategoriesProductDto: CreateCategoriesProductDto) {
    return this.categoriesProductService.create(createCategoriesProductDto);
  }

  @Get()
  findAll() {
    return this.categoriesProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesProductService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriesProductDto: UpdateCategoriesProductDto) {
    return this.categoriesProductService.update(+id, updateCategoriesProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesProductService.remove(+id);
  }
}
