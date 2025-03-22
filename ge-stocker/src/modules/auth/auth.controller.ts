import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
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
async googleAuthRedirect(@Req() req, @Res() res) {
  const profile = req.user;
  await this.authService.registerOrUpdateGoogleUser(profile);
  return res.redirect('http://localhost:3001/login');
}

@Get('google/login')
@UseGuards(GoogleAuthGuard)
async googleLogin(@Req() req, @Res() res) {
  const profile = req.user;
  const user = await this.authService.loginWithGoogle(profile);
  return res.redirect('http://localhost:3001/dashboard/perfil').cookie('token', user.token, { httpOnly: true });
}
}
