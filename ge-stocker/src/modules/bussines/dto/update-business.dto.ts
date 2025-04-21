import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessDto } from 'src/modules/bussines/dto/create-business.dto';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {}
