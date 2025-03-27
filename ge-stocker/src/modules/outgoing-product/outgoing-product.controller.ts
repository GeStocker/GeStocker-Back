import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OutgoingProductService } from './outgoing-product.service';
import { CreateOutgoingProductDto } from './dto/create-outgoing-product.dto';
import { UpdateOutgoingProductDto } from './dto/update-outgoing-product.dto';

@Controller('outgoing-product')
export class OutgoingProductController {
  constructor(private readonly outgoingProductService: OutgoingProductService) {}

  @Post()
  create(@Body() createOutgoingProductDto: CreateOutgoingProductDto) {
    return this.outgoingProductService.create(createOutgoingProductDto);
  }

  @Get()
  findAll() {
    return this.outgoingProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.outgoingProductService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOutgoingProductDto: UpdateOutgoingProductDto) {
    return this.outgoingProductService.update(+id, updateOutgoingProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.outgoingProductService.remove(+id);
  }
}
