import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { MatchPassword } from 'src/helpers/passwordMatcher';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  password: string;
  @Validate(MatchPassword, ['password'])
  passwordConfirmation: string;
  @IsNotEmpty()
  phone: number;
  @IsNotEmpty()
  country?: string;
  @IsNotEmpty()
  city?: string;
  @IsNotEmpty()
  address: string;
  @IsNotEmpty()
  roles: string[];
}

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
