import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateBussinesDto {
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsNotEmpty()
  @MinLength(8)
  direction: string;
}
