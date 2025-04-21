import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsEmail, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { MatchPassword } from 'src/helpers/passwordMatcher';
import { UserRole } from 'src/interfaces/roles.enum';

export enum SubscriptionPlan {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  BUSINESS = 'business'
}

export class CreateAuthDto {
  @ApiProperty({
      example: 'caroyfer@mail.com',
      description: 'Email del usuario'
    })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Carolina',
    description: 'Nombre del usuario'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Admin12345.',
    description: 'Contraseña de la cuenta del usuario'
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Admin12345.',
    description: 'Confirmacion de la contraseña de la cuenta del usuario'
  })
  @Validate(MatchPassword, ['password'])
  passwordConfirmation: string;
  
  @ApiProperty({
    example: '1145698563',
    description: 'Telefono de contacto del usuario'
  })
  @IsString()
  @IsNotEmpty()
  phone: string;
  
  @ApiProperty({
    example: 'Colombia',
    description: 'Pais de residencia del usuario'
  })
  @IsString()
  @IsNotEmpty()
  country?: string;
  
  @ApiProperty({
    example: 'Buenos Aires',
    description: 'Ciudad de residencia del usuario'
  })
  @IsString()
  @IsNotEmpty()
  city?: string;

  @ApiProperty({
    example: 'Calle Principal 25',
    description: 'Direccion de residencia del usuario'
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: '[basic]',
    description: 'Rol del usuario'
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(1)
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
  
  @ApiProperty({
    example: 'basic',
    description: 'Plan seleccionado por el usuario que se registra'
  })
  @IsString()
  @IsIn(['basic', 'professional', 'business'])
  selectedPlan: string;

  @IsOptional()
  @IsString()
  img: string;
}

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
