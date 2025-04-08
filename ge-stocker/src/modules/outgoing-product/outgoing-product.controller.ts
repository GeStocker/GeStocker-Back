import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OutgoingProductService } from './outgoing-product.service';
import { CreateOutgoingProductDto } from './dto/create-outgoing-product.dto';
import { UpdateOutgoingProductDto } from './dto/update-outgoing-product.dto';

@Controller('outgoing-product')
export class OutgoingProductController {
  constructor(private readonly outgoingProductService: OutgoingProductService) {}

  @Get(':salesOrderId')
  findOutgoingProductsBySalesOrder(@Param('salesOrderId') salesOrderId: string) {
    return this.outgoingProductService.findOutgoingProductsBySalesOrder(salesOrderId);
  }

  @Post(':salesOrderId')
  createOutgoingProductInSalesOrder(
    @Param('salesOrderId') salesOrderId: string,
    @Body() createOutgoingProductDto: CreateOutgoingProductDto,
  ) {
    return this.outgoingProductService.createOutgoingProductInSalesOrder(salesOrderId, createOutgoingProductDto)
  }

  @Patch(':salesOrderId/:outgoingProductId')
  updateOutgoingProductInSalesOrder(
    @Param('salesOrderId') salesOrderId: string,
    @Param('outgoingProductId') outgoingProductId: string,
    @Body() updateOutgoingProductDto: UpdateOutgoingProductDto,
  ) {
    return this.outgoingProductService.updateOutgoingProductInSalesOrder(salesOrderId, outgoingProductId, updateOutgoingProductDto)
  }

  @Delete(':salesOrderId/:outgoingProductId')
  removeOutgoingProductFromSalesOrder(
    @Param('outgoingProductId') outgoingProductId: string,
    @Param('salesOrderId') salesOrderId: string,
  ) {
    return this.outgoingProductService.removeOutgoingProductFromSalesOrder(salesOrderId, outgoingProductId);
  }
}
