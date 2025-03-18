import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateInventoryProductDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  inventoryId: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  price: number;
}