import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  address: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description: string;
}
