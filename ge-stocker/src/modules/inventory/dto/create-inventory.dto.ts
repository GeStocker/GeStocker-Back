import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateInventoryDto {
  @IsNotEmpty()
  @MinLength(5)
  name: string;
  @IsNotEmpty()
  @MinLength(10)
  description: string;
  
  @MinLength(10)
  adress: string;
}
