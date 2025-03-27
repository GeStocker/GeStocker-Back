import { IsNotEmpty, IsString } from "class-validator";

export class CreateCollaboratorDto {


      @IsString()
      @IsNotEmpty()
      email: string;

      @IsString()
      @IsNotEmpty()
      username: string;

      @IsString()
      @IsNotEmpty()
      password: string;
      
      @IsString()
      @IsNotEmpty()
      inventoryId: string;
}
