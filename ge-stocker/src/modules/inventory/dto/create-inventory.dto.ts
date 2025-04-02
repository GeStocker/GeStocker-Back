import { IsNotEmpty, MinLength, IsString, IsUUID } from 'class-validator';

export class CreateInventoryDto {
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  name: string;

  @IsNotEmpty()
  @MinLength(10)
  @IsString()
  description: string;
  
  @IsNotEmpty()
  @MinLength(10)
  @IsString()
  address: string;
}
