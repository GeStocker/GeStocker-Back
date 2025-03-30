import { Controller, Post, Body, Get, UseGuards, Req, Res, HttpStatus } from "@nestjs/common";
import { CustomRequest } from "src/interfaces/custom-request.interface";
import { GoogleAuthGuard } from "./authGoogle.guard";
import { CreateAuthDto, LoginAuthDto } from "./dto/create-auth.dto";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/signup')
  async create(@Body() user: CreateAuthDto) {
    const result = await this.authService.registerUser(user);
    return {
      ...result.user,
      checkoutUrl: result.checkoutUrl
    };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: CustomRequest, @Res() res) {
    const loginResponse = await this.authService.loginWithGoogle(req.user);
    
    let redirectUrl = `${this.configService.get('FRONTEND_URL')}/dashboard?token=${loginResponse.token}`;
    
    if (loginResponse.checkoutUrl) {
      redirectUrl += `&checkoutUrl=${encodeURIComponent(loginResponse.checkoutUrl)}`;
    }

    return res.redirect(redirectUrl);
  }

  @Post('/login')
  async login(
    @Body() credentials: LoginAuthDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(credentials);

    // Si requiere suscripción, devolver información adicional
    if (result.requiresSubscription) {
      return {
        statusCode: HttpStatus.OK,
        message: result.success,
        data: {
          token: result.token,
          user: result.user,
          requiresSubscription: true,
          checkoutUrl: result.checkoutUrl
        }
      };
    }

    // Login exitoso normal
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