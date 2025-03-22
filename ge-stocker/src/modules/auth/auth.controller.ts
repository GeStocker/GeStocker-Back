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
  async googleAuth(@Req() req) { }

  @Get('google/login')
@UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() req: CustomRequest, @Res() res) {
  const profile = req.user;
  const user = await this.authService.loginWithGoogle(profile);
  res.cookie('token', user.token, { httpOnly: true });
  return res.redirect('http://localhost:3001/dashboard/perfil');
}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthRedirect(@Req() req, @Res() res) {
  try {
    const profile = req.user;
    const user = await this.authService.registerOrUpdateGoogleUser(profile) as { token: string };
    
    // Aquí podrías enviar un token en la cookie o en el almacenamiento local
    res.cookie('token', user.token, { httpOnly: true });
    return res.redirect('http://localhost:3001/login');
  } catch (error) {
    // Manejo de errores
    console.error(error);
    return res.redirect('http://localhost:3001/error'); // Redirigir a una página de error
  }
}
}
