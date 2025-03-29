import { Controller, Post, Body, Get, Req, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { GoogleAuthGuard } from './authGoogle.guard';
import { CustomRequest } from 'src/interfaces/custom-request.interface';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data or email already registered' })
  async create(@Body() user: CreateAuthDto, @Res() res: Response) {
    try {
      const { checkoutUrl } = await this.authService.registerUser(user);
      return res.status(HttpStatus.CREATED).json({ 
        message: 'User registered successfully. Please complete your subscription.',
        checkoutUrl 
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: error.message || 'Registration failed'
      });
    }
  }

  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials or subscription required' })
  async login(@Body() credentials: LoginAuthDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(credentials);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: error.message || 'Login failed'
      });
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  async googleAuth(@Req() req: CustomRequest) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: HttpStatus.TEMPORARY_REDIRECT, description: 'Redirects to frontend with token' })
  async googleAuthRedirect(@Req() req: CustomRequest, @Res() res: Response) {
    try {
      const profile = req.user;
      const loginResponse = await this.authService.handleGoogleUser(profile);
      if (loginResponse.requiresSubscription) {
        return res.redirect(`https://ge-stocker.vercel.app/select-plan?token=${loginResponse.tempToken}`);
      } else {
        return res.redirect(`https://ge-stocker.vercel.app/dashboard/perfil?token=${loginResponse.token}`);
      }
    } catch (error) {
      return res.redirect(`https://ge-stocker.vercel.app/login?error=${encodeURIComponent(error.message)}`);
    }
  }
}