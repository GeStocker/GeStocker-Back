import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { GoogleAuthGuard } from './authGoogle.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  create(@Body() user: CreateAuthDto) {
    return this.authService.registerUser(user);
  }
  @Post('/login')
  login(@Body() user: LoginAuthDto) {
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    const profile = req.user;
    const user = await this.authService.registerOrUpdateGoogleUser(profile);
    return user;
  }
}
