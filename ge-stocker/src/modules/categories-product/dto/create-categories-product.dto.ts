import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateCategoriesProductDto {
  @IsNotEmpty()
  @MinLength(5)
  name: string;
}
