import { IsEmail, IsNotEmpty, Validate } from 'class-validator';
import { MatchPassword } from 'src/helpers/passwordMatcher';
import { UserRole } from 'src/modules/roles/dto/create-role.dto';

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
  roles: UserRole[];
}

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
