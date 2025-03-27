import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SalesOrderService } from './sales-order.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('sales-order')
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Post(':inventoryId')
  @UseGuards(AuthGuard)
  createSalesOrder(
    @Body() createSalesOrderDto: CreateSalesOrderDto,
    @Param('inventoryId') inventoryId: string,
  ) {
    return this.salesOrderService.createSalesOrder(createSalesOrderDto, inventoryId);
  }

  @Get()
  findAll() {
    return this.salesOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesOrderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesOrderDto: UpdateSalesOrderDto) {
    return this.salesOrderService.update(+id, updateSalesOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesOrderService.remove(+id);
  }
}
