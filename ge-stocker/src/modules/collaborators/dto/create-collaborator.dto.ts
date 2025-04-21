import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCollaboratorDto {

      @ApiProperty({
            example: 'ferycaro@mail.com',
            description: 'Email del colaborador que esta creando el usuario'
      })
      @IsEmail()
      @IsNotEmpty()
      email: string;

      @ApiProperty({
            example: 'FerYCaro',
            description: 'Nombre de usuario de la cuenta del colaborador que esta creando el usuario'
      })
      @IsString()
      @IsNotEmpty()
      username: string;
      
      @ApiProperty({
            example: 'Collab12345.',
            description: 'Contraseña de la cuenta del colaborador que esta creando el usuario'
      })
      @IsString()
      @IsNotEmpty()
      password: string;
      
      @ApiProperty({
            example: '',
            description: 'Id del inventario al cual se le asigna al colaborador'
      })
      @IsUUID()
      @IsNotEmpty()
      inventoryId: string;
};

export class LoginCollaboratorDto {
      @IsString()
      @IsNotEmpty()
      email: string;

      @IsNotEmpty()
      password: string;
}
