import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpStatus, Query } from "@nestjs/common";
import { CustomRequest } from "src/interfaces/custom-request.interface";
import { GoogleAuthGuard } from "./authGoogle.guard";
import { CreateAuthDto, LoginAuthDto } from "./dto/create-auth.dto";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { PasswordResetGuard } from "./password-reset.guard";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('/signup')
  async register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registerUser(createAuthDto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: 'Correo enviado con codigo de verificacion' };
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { email: string; code: string }) {
    const token = await this.authService.verifyCode(body.email, body.code);
    return { token };
  }

  @Post('reset-password')
  @UseGuards(PasswordResetGuard)
  async resetPassword(
    @Body('newPassword') newPassword: string,
    @Req() req,
  ) {
    await this.authService.resetPassword(req.user.sub, newPassword);
    return { message: 'Contraseña actualizada' };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(
    @Req() req: CustomRequest,
    @Query('plan') plan: string
  ) {
    req.session.selectedPlan = plan;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: CustomRequest, @Res() res) {
    const selectedPlan = req.session.selectedPlan;
    const loginResponse = await this.authService.loginWithGoogle(req.user, selectedPlan);

    if (loginResponse.isNewUser) {
      return res.redirect(loginResponse.registerUrl);
    }

    let redirectUrl = `${this.configService.get('FRONTEND_URL')}/dashboard/perfil?token=${loginResponse.token}`;

    if (loginResponse.checkoutUrl) {
      redirectUrl = loginResponse.checkoutUrl;
    }

    return res.redirect(redirectUrl);
  }

  @Post('/login')
  async login(
    @Body() credentials: LoginAuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(credentials);

    if (result.requiresSubscription) {
      return {
        statusCode: HttpStatus.OK,
        message: result.success,
        data: {
          token: null,
          user: null,
          requiresSubscription: true,
          checkoutUrl: result.checkoutUrl
        }
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: result.success,
      data: {
        token: result.token,
        user: result.user
      }
    };
  }
}