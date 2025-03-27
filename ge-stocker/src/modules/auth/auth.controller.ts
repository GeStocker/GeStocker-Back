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
    console.log('Perfil de Google:', profile);
    const loginResponse = await this.authService.loginWithGoogle(profile);
    console.log('Token generado:', loginResponse.token);
    res.cookie('token', loginResponse.token, {
      httpOnly: true,
      secure: true, // SOLO para HTTPS
      sameSite: 'none', // Obligatorio para cross-domain
      domain: '.vercel.app', // Dominio padre
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });
  
    console.log('Cookies establecidas:', res.getHeaders()['set-cookie']);
  
    return res.redirect('https://ge-stocker.vercel.app/dashboard/perfil');
  }
}
