import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CategoriesProductService } from './categories-product.service';
import { CreateCategoriesProductDto } from './dto/create-categories-product.dto';
import { UpdateCategoriesProductDto } from './dto/update-categories-product.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('categories-product')
export class CategoriesProductController {
  constructor(private readonly categoriesProductService: CategoriesProductService) { }

  @Post(':businessId')
  @UseGuards(AuthGuard)
  async createCategory(
    @Body() createCategoriesProductDto: CreateCategoriesProductDto,
    @Param('businessId', ParseUUIDPipe) businessId: string
  ) {
    return this.categoriesProductService.createCategory(
      createCategoriesProductDto,
      businessId
    );
  }

  @Get('business/:businessId')
  @UseGuards(AuthGuard)
  getAllCategories(@Param('businessId', ParseUUIDPipe) businessId: string) {
    return this.categoriesProductService.getAllCategories(businessId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesProductService.findOne(+id);
  }

  @Patch(':businessId/:id')
  updateCategory(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('id') id: string,
    @Body() updateCategoriesProductDto: UpdateCategoriesProductDto) {
    return this.categoriesProductService.updateCategory(id, businessId, updateCategoriesProductDto);
  }
}
