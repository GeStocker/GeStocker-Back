import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCollaboratorDto {

      @IsEmail()
      @IsNotEmpty()
      email: string;

      @IsString()
      @IsNotEmpty()
      username: string;

      @IsString()
      @IsNotEmpty()
      password: string;
      
      @IsUUID()
      @IsNotEmpty()
      inventoryId: string;
};

export class LoginCollaboratorDto {
      @IsString()
      @IsNotEmpty()
      username: string;

      @IsNotEmpty()
      password: string;
}
