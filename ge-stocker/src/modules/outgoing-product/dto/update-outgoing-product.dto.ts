import { PartialType } from '@nestjs/swagger';
import { CreateOutgoingProductDto } from './create-outgoing-product.dto';

export class UpdateOutgoingProductDto extends PartialType(CreateOutgoingProductDto) {}
