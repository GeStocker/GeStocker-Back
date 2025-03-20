import { IsNotEmpty, MinLength, IsString } from 'class-validator';

export class CreateCategoriesProductDto {
  @IsNotEmpty()
  @MinLength(5)
  @IsString()
  name: string;
}
