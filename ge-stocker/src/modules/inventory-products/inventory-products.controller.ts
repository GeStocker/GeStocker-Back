import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InventoryProductsService } from './inventory-products.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateInventoryProductsDto } from './dto/create-inventory-product.dto';
import { UpdatePriceDto, UpdateStockProductBatchDto } from './dto/update-inventory-product.dto';
import { GetInventoryProductsFilterDto } from './dto/inventory-product-filter.dto';

@Controller('inventory-products')
export class InventoryProductsController {
  constructor(private readonly inventoryProductsService: InventoryProductsService) {}

  @Get(':inventoryId')
  @UseGuards(AuthGuard)
  getAllInventoryProducts(
    @Param('inventoryId', ParseUUIDPipe) inventoryId: string,
    @Query() inventoryProductFilterDto: GetInventoryProductsFilterDto,
  ) {
    return this.inventoryProductsService.getAllInventoryProducts(inventoryId, inventoryProductFilterDto);
  };

  @Put('price/:id')
  @UseGuards(AuthGuard)
  updatePrice(
    @Param('id', ParseUUIDPipe) inventoryProductId: string,
    @Body() updatePriceDto: UpdatePriceDto,
  ) {
    return this.inventoryProductsService.updatePrice(inventoryProductId, updatePriceDto)
  };
}
