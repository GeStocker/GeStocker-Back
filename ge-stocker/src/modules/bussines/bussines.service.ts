import { Injectable } from '@nestjs/common';
import { CreateBussinesDto } from './dto/create-bussine.dto';
import { UpdateBussinesDto } from './dto/update-bussine.dto';


@Injectable()
export class BussinesService {
  create(createBussinesDto: CreateBussinesDto) {
    return 'This action adds a new bussine';
  }

  findAll() {
    return `This action returns all bussines`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bussine`;
  }

  update(id: number, updateBussinesDto: UpdateBussinesDto) {
    return `This action updates a #${id} bussine`;
  }

  remove(id: number) {
    return `This action removes a #${id} bussine`;
  }
}
