import {
  IsNotEmpty,
  MinLength,
  IsNumber,
  IsUrl,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  name: string;

  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsUrl()
  img: string;

  @IsNotEmpty()
  category: string;
}
