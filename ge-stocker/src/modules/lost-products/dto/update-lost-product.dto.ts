import { PartialType } from '@nestjs/swagger';
import { CreateLostProductDto } from './create-lost-product.dto';

export class UpdateLostProductDto extends PartialType(CreateLostProductDto) {}
