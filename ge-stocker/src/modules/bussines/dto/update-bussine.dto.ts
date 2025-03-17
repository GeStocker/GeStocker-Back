import { PartialType } from '@nestjs/mapped-types';
import { CreateBussineDto } from 'src/modules/dto/create-bussine.dto';

export class UpdateBussinesDto extends PartialType(CreateBussineDto) {}
