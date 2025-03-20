import {
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
  IsUUID,
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

  @IsString()
  @IsOptional()
  img?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsUUID()
  businessId: string;
}
