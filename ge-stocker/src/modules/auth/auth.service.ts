// src/modules/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from '../../modules/payments/payments.service';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { UserRole } from '../../interfaces/roles.enum';
import { PaymentSession } from '../payments/entities/payment-session-entity';
import { GoogleLoginResponse } from 'src/interfaces/google-login-response';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PaymentSession)
    private readonly paymentSessionRepository: Repository<PaymentSession>,
    private readonly jwtService: JwtService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async registerUser(createAuthDto: CreateAuthDto): Promise<{ checkoutUrl: string }> {
    return this.userRepository.manager.transaction(async (manager) => {
      
      const existingUser = await manager.findOne(User, { where: { email: createAuthDto.email } });
      if (existingUser) throw new BadRequestException('Email already registered');

      const newUser = await manager.save(User, {
        ...createAuthDto,
        password: await bcrypt.hash(createAuthDto.password, 10),
        roles: [UserRole.PENDING],
        isActive: false,
      });

      if (!newUser) {
        throw new BadRequestException('Failed to create user');
      }
      const priceId = this.paymentsService.getPriceIdForPlan(createAuthDto.selectedPlan);
      const { url } = await this.paymentsService.createCheckoutSession(
        priceId,
        createAuthDto.selectedPlan,
        newUser.id,
        manager,
      );

      if (!url) {
        throw new BadRequestException('Failed to generate checkout URL');
      }

      return { checkoutUrl: url };
    });
  }

  // auth.service.ts
async handleGoogleUser(profile: any): Promise<GoogleLoginResponse> {
  return this.userRepository.manager.transaction(async (manager) => {
    let user = await manager.findOne(User, { 
      where: { email: profile.email },
      relations: ['payments']
    });

    if (!user) {
      // Crear usuario en estado pendiente
      user = await manager.save(User, {
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        roles: [UserRole.PENDING],
        isActive: false,
        img: profile.picture
      });

      // Retornar token temporal para selección de plan
      const tempToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        { expiresIn: '15m' }
      );

      return {
        tempToken,
        requiresSubscription: true,
        redirectTo: '/select-plan'
      };
    }

    // Verificar si el usuario existente necesita suscripción
    if (user.roles.includes(UserRole.PENDING)) {
      const tempToken = this.jwtService.sign(
        { id: user.id, email: user.email },
        { expiresIn: '15m' }
      );

      return {
        tempToken,
        requiresSubscription: true,
        redirectTo: '/select-plan'
      };
    }

    // Usuario con suscripción completa
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      roles: user.roles
    });

    return {
      token,
      requiresSubscription: false,
      redirectTo: '/dashboard'
    };
  });
}

  async login(
    credentials: LoginAuthDto,
  ): Promise<{ success: string; token: string }> {
    const { email, password } = credentials;
    
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['payments']
    });
  
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
  
    if (user.roles.includes(UserRole.PENDING)) {
      throw new UnauthorizedException('Por favor complete su suscripción antes de acceder.');
    }
  
    const hasActivePayment = user.payments?.some(payment => 
      payment.status === 'succeeded' && 
      new Date(payment.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
  
    if (!hasActivePayment && !user.roles.includes(UserRole.ADMIN) && !user.roles.includes(UserRole.SUPERADMIN)) {
      throw new UnauthorizedException('Su suscripción ha expirado.');
    }
  
    const userPayload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  
    const token = this.jwtService.sign(userPayload, { expiresIn: '12h' });
  
    return {
      success: 'Inicio de sesión exitoso',
      token,
    };
  }
}