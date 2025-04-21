import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsString, IsUUID } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    example: 'Local mayorista, Vicente Lopez',
    description: 'Nombre del local'
  })
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Local en Vicente Lopez mayorista, venta de telefonos usados',
    description: 'Descripcion del local o inventario que esta creando'
  })
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  description: string;
  
  @ApiProperty({
    example: 'Calle Principal 5',
    description: 'Direccion del local'
  })
  @IsNotEmpty()
  @MinLength(3)
  @IsString()
  address: string;
}
