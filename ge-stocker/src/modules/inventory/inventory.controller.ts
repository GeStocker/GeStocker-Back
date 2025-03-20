import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  createInventory(@Body() createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    return this.inventoryService.createInventory(createInventoryDto);
  }

  @Get()
  getInventories(): Promise<Inventory[]> {
    return this.inventoryService.getInventories();
  }

  @Get(':id')
  getInventoryById(@Param('id') id: string): Promise<Inventory> {
    return this.inventoryService.getInventoryById(id);
  }

  @Patch(':id')
  updateInventory(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    return this.inventoryService.updateInventory(id, updateInventoryDto);
  }

  @Delete(':id')
  removeInventory(@Param('id') id: string): Promise<Inventory> {
    return this.inventoryService.removeInventory(id);
  }
}
