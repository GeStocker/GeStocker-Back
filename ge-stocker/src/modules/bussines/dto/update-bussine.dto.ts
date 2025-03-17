import { PartialType } from '@nestjs/mapped-types';
import { CreateBussinesDto } from 'src/modules/bussines/dto/create-bussine.dto';

export class UpdateBussinesDto extends PartialType(CreateBussinesDto) {}
