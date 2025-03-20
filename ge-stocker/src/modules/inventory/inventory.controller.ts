import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '../../interfaces/roles.enum';
import { RolesGuard } from '../auth/roles.guard';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
    @UseGuards(AuthGuard)
  createInventory(@Body() createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    return this.inventoryService.createInventory(createInventoryDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  getInventories(): Promise<Inventory[]> {
    return this.inventoryService.getInventories();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  getInventoryById(@Param('id') id: string): Promise<Inventory> {
    return this.inventoryService.getInventoryById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updateInventory(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    return this.inventoryService.updateInventory(id, updateInventoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  removeInventory(@Param('id') id: string): Promise<Inventory> {
    return this.inventoryService.removeInventory(id);
  }
}
