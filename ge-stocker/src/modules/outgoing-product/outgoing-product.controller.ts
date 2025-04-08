import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OutgoingProductService } from './outgoing-product.service';
import { CreateOutgoingProductDto } from './dto/create-outgoing-product.dto';
import { UpdateOutgoingProductDto } from './dto/update-outgoing-product.dto';

@Controller('outgoing-product')
export class OutgoingProductController {
  constructor(private readonly outgoingProductService: OutgoingProductService) {}

}
