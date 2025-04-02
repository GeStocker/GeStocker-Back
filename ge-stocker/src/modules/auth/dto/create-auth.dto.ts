import { ArrayMaxSize, IsArray, IsEmail, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { MatchPassword } from 'src/helpers/passwordMatcher';
import { UserRole } from 'src/interfaces/roles.enum';

export enum SubscriptionPlan {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  BUSINESS = 'business'
}

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
