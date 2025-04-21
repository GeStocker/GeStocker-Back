import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { OutgoingProductService } from './outgoing-product.service';
import { CreateOutgoingProductDto } from './dto/create-outgoing-product.dto';
import { UpdateOutgoingProductDto } from './dto/update-outgoing-product.dto';

@Controller('outgoing-product')
export class OutgoingProductController {
  constructor(private readonly outgoingProductService: OutgoingProductService) {}

  @Get(':salesOrderId')
  findOutgoingProductsBySalesOrder(@Param('salesOrderId', ParseUUIDPipe) salesOrderId: string) {
    return this.outgoingProductService.findOutgoingProductsBySalesOrder(salesOrderId);
  }

  @Post(':salesOrderId')
  createOutgoingProductInSalesOrder(
    @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string,
    @Body() createOutgoingProductDto: CreateOutgoingProductDto,
  ) {
    return this.outgoingProductService.createOutgoingProductInSalesOrder(salesOrderId, createOutgoingProductDto)
  }

  @Patch(':salesOrderId/:outgoingProductId')
  updateOutgoingProductInSalesOrder(
    @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string,
    @Param('outgoingProductId', ParseUUIDPipe) outgoingProductId: string,
    @Body() updateOutgoingProductDto: UpdateOutgoingProductDto,
  ) {
    return this.outgoingProductService.updateOutgoingProductInSalesOrder(salesOrderId, outgoingProductId, updateOutgoingProductDto)
  }

  @Delete(':salesOrderId/:outgoingProductId')
  removeOutgoingProductFromSalesOrder(
    @Param('outgoingProductId', ParseUUIDPipe) outgoingProductId: string,
    @Param('salesOrderId', ParseUUIDPipe) salesOrderId: string,
  ) {
    return this.outgoingProductService.removeOutgoingProductFromSalesOrder(salesOrderId, outgoingProductId);
  }
}
