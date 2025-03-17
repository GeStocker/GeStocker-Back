import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriesNegocioDto } from './create-categories-negocio.dto';

export class UpdateCategoriesNegocioDto extends PartialType(CreateCategoriesNegocioDto) {}
