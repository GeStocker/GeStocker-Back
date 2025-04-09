import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
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
    @Param('inventoryId', ParseUUIDPipe) inventoryId: string,
  ) {
    return this.salesOrderService.createSalesOrder(createSalesOrderDto, inventoryId);
  }

  @Get(':inventoryId')
  getAllSalesOrders(@Param('inventoryId') inventoryId: string) {
    return this.salesOrderService.getAllSalesOrders(inventoryId);
  }

  @Get('byId/:inventoryId/:salesOrderId')
  getSalesOrderById(
    @Param('inventoryId', ParseUUIDPipe) inventoryId: string,
    @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string
  ) {
    return this.salesOrderService.getSalesOrderById(inventoryId, salesOrderId)
  }

  @Patch(':salesOrderId')
  updateSalesOrder(
    @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string,
    @Body() updateSalesOrderDto: UpdateSalesOrderDto
  ) {
    return this.salesOrderService.updateSalesOrder(salesOrderId, updateSalesOrderDto)
  }
}
