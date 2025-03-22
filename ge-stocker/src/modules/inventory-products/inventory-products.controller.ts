import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { InventoryProductsService } from './inventory-products.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateInventoryProductsDto } from './dto/create-inventory-product.dto';
import { UpdatePriceDto, UpdateStockProductBatchDto } from './dto/update-inventory-product.dto';

@Controller('inventory-products')
export class InventoryProductsController {
  constructor(private readonly inventoryProductsService: InventoryProductsService) {}

  @Post()
  @UseGuards(AuthGuard)
  addProductsToInventory(
    @Body() createInventoryProductsDto: CreateInventoryProductsDto
  ) {
    const inventoryId = createInventoryProductsDto.inventoryId;
    const products = createInventoryProductsDto.products;
    return this.inventoryProductsService.addProductsToInventory(inventoryId, products)
  };

  @Get(':inventoryId')
  @UseGuards(AuthGuard)
  getAllInventoryProducts(@Param('inventoryId', ParseUUIDPipe) inventoryId: string) {
    return this.inventoryProductsService.getAllInventoryProducts(inventoryId);
  };

  @Put('price/:id')
  @UseGuards(AuthGuard)
  updatePrice(
    @Param('id') inventoryProductId: string,
    @Body() updatePriceDto: UpdatePriceDto,
  ) {
    return this.inventoryProductsService.updatePrice(inventoryProductId, updatePriceDto)
  };
}
