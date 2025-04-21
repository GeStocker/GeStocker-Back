import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ImportProductDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;
}
