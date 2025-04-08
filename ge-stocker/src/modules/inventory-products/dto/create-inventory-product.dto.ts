import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsNumber, Min, IsNotEmpty, ArrayMinSize, ValidateNested, IsArray } from 'class-validator';

export class CreateInventoryProductsDto {
  @ApiProperty({
    example: [{productId: '', stock: 50}, {productId: '', stock: 100}],
    description: 'Array de productos que ingresan al inventario',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InventoryProductDataDto)
  products: InventoryProductDataDto[];
}

export class InventoryProductDataDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  stock: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;
}

