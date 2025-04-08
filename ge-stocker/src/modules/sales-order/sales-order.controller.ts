import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SalesOrderService } from './sales-order.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CustomRequest } from 'src/interfaces/custom-request.interface';

@Controller('sales-order')
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Post(':inventoryId')
  @UseGuards(AuthGuard)
  createSalesOrder(
    @Body() createSalesOrderDto: CreateSalesOrderDto,
    @Req() request: CustomRequest,
    @Param('inventoryId') inventoryId: string,
  ) {
    const userId = request.user.id;
    return this.salesOrderService.createSalesOrder(createSalesOrderDto, inventoryId, userId);
  }

  @Get(':inventoryId')
  getAllSalesOrders(@Param('inventoryId') inventoryId: string) {
    return this.salesOrderService.getAllSalesOrders(inventoryId);
  }

  @Get('byId/:inventoryId/:salesOrderId')
  getSalesOrderById(
    @Param('inventoryId') inventoryId: string,
    @Param('salesOrderId') salesOrderId: string
  ) {
    return this.salesOrderService.getSalesOrderById(inventoryId, salesOrderId)
  }

  @Patch(':salesOrderId')
  updateSalesOrder(
    @Param('salesOrderId') salesOrderId: string,
    @Body() updateSalesOrderDto: UpdateSalesOrderDto
  ) {
    return this.salesOrderService.updateSalesOrder(salesOrderId, updateSalesOrderDto)
  }
}
