import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsString } from 'class-validator';

export class CreateCategoriesProductDto {
  @ApiProperty({
    example: 'Telefonos',
    description: 'Nombre de la categoria de productos'
  })
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  name: string;
}
