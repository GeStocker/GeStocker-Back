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
}
