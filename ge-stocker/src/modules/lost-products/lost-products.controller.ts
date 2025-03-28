import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LostProductsService } from './lost-products.service';
import { CreateLostProductDto } from './dto/create-lost-product.dto';
import { UpdateLostProductDto } from './dto/update-lost-product.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('lost-products')
export class LostProductsController {
  constructor(private readonly lostProductsService: LostProductsService) {}

  @Post(':businessId/:inventoryId')
  @UseGuards(AuthGuard)
  registerLostProducts(
    @Body() createLostProductDto: CreateLostProductDto,
    @Param('businessId') businessId: string,
    @Param('inventoryId') inventoryId: string,
  ) {
    return this.lostProductsService.registerLostProducts(createLostProductDto, businessId, inventoryId);
  }

  @Get()
  findAll() {
    return this.lostProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lostProductsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLostProductDto: UpdateLostProductDto) {
    return this.lostProductsService.update(+id, updateLostProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lostProductsService.remove(+id);
  }
}
