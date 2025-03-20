import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  createInventory(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.createInventory(createInventoryDto);
  }

  @Get()
  getInventories() {
    return this.inventoryService.getInventories();
  }

  @Get(':id')
  getInventoryById(@Param('id') id: string) {
    return this.inventoryService.getInventoryById(id);
  }

  @Patch(':id')
  updateInventory(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.updateInventory(id, updateInventoryDto);
  }

  @Delete(':id')
  removeInventory(@Param('id') id: string) {
    return this.inventoryService.removeInventory(id);
  }
}
