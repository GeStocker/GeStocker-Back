import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from '../../interfaces/roles.enum';
import { RolesGuard } from '../auth/roles.guard';
import { CustomRequest } from 'src/interfaces/custom-request.interface';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post(':businessId')
  @UseGuards(AuthGuard)
  createInventory(
    @Body() createInventoryDto: CreateInventoryDto,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Req() request: CustomRequest,
  ): Promise<Inventory> {
    const userId = request.user.id;
    return this.inventoryService.createInventory(createInventoryDto, businessId, userId);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  getInventories(): Promise<Inventory[]> {
    return this.inventoryService.getInventories();
  }

  @Get(':businessId')
  @UseGuards(AuthGuard)
  getBusinessInventories(@Param('businessId', ParseUUIDPipe) businessId: string){
    return this.inventoryService.getBusinessInventories(businessId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  getInventoryById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: CustomRequest,
  ): Promise<Inventory> {
    return this.inventoryService.getInventoryById(id, request);
  }

  @Patch(':businessId/:id')
  @UseGuards(AuthGuard)
  updateInventory(
    @Param('businessId') businessId: string, 
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    return this.inventoryService.updateInventory(id, updateInventoryDto, businessId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  removeInventory(@Param('id', ParseUUIDPipe) id: string): Promise<Inventory> {
    return this.inventoryService.removeInventory(id);
  }
}
