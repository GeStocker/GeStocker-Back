import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Iphone 15 Pro 256GB',
    description: 'Nombre del producto',
    minLength: 5,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  name: string;

  @ApiProperty({
    example: 'Iphone 15 Pro de 256GB, año 2024',
    description: 'Descripcion del producto'
  })
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Telefonos',
    description: 'Categoria del producto'
  })
  @IsNotEmpty()
  @IsString()
  category: string;
}
