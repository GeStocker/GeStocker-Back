import { ArrayMaxSize, IsArray, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { MatchPassword } from 'src/helpers/passwordMatcher';
import { UserRole } from 'src/interfaces/roles.enum';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @Validate(MatchPassword, ['password'])
  passwordConfirmation: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  country?: string;

  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(1)
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @IsString()
  @IsNotEmpty()
  selectedPlan: 'monthly' | 'yearly'; // Nuevo campo añadido

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
