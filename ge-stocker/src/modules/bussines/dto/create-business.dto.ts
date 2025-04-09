import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateBusinessDto {
  @ApiProperty({
    example: 'Productos de tecnologia',
    description: 'Nombre del negocio que se esta creando'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'Calle Principal 6',
    description: 'Direccion del negocio que maneja el usuario'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  address: string;

  @ApiProperty({
    example: 'Venta de productos de tecnologia, generalmente usados',
    description: 'Descripcion del negocio que se esta creando'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  description: string;
}
