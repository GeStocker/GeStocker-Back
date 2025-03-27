import { IsNotEmpty, IsString } from "class-validator";

export class CreateCollaboratorDto {
      @IsString()
      @IsNotEmpty()
      username: string;

      @IsString()
      @IsNotEmpty()
      password: string;
      
      @IsNotEmpty()
      isActive: boolean
}
