import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  create(@Body() user: CreateAuthDto) {
    return this.authService.registerUser(user);
  }
  @Post('/login')
  login(@Body() user: LoginAuthDto) {
    return this.authService.login(user);
  }
}
