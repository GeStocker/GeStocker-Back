import { Controller, Post, Body, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { GoogleAuthGuard } from './authGoogle.guard';
import { CustomRequest } from 'src/interfaces/custom-request.interface';

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
  async googleAuth(@Req() req: CustomRequest) { }

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthRedirect(@Req() req: CustomRequest, @Res() res) {
  const profile = req.user;
  await this.authService.registerOrUpdateGoogleUser(profile);
  const loginResponse = await this.authService.loginWithGoogle(profile);
  res.cookie('token', loginResponse.token, { httpOnly: false });
  return res.redirect('https://ge-stocker.vercel.app/dashboard/perfil');
}
}
