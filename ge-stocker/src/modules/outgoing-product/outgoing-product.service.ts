import { Injectable } from '@nestjs/common';
import { CreateOutgoingProductDto } from './dto/create-outgoing-product.dto';
import { UpdateOutgoingProductDto } from './dto/update-outgoing-product.dto';

@Injectable()
export class OutgoingProductService {
  create(createOutgoingProductDto: CreateOutgoingProductDto) {
    return 'This action adds a new outgoingProduct';
  }

  findAll() {
    return `This action returns all outgoingProduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} outgoingProduct`;
  }

  update(id: number, updateOutgoingProductDto: UpdateOutgoingProductDto) {
    return `This action updates a #${id} outgoingProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} outgoingProduct`;
  }
}
