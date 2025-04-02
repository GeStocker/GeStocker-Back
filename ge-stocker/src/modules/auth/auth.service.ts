import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto, SubscriptionPlan } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../../interfaces/roles.enum';
import { JwtService } from '@nestjs/jwt';
import { StripeService } from '../payments/stripe.service';
import { PurchasesService } from '../payments/payments.service';
import { ConfigService } from '@nestjs/config';
import { sendEmail } from 'src/emails/config/mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(StripeService)
    private readonly stripeService: StripeService,
    @Inject(PurchasesService)
    private readonly purchasesService: PurchasesService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(
    user: CreateAuthDto,
  ): Promise<{ user: Partial<User>; checkoutUrl: string }> {
    const {
      email,
      password,
      passwordConfirmation,
      roles,
      selectedPlan,
      ...userWithoutConfirmation
    } = user;

    // Validación de usuario existente
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Correo ya registrado.');
    }

    // Validación de contraseña
    if (password !== passwordConfirmation) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    // Validación de rol
    const role = roles[0];
    if (!role) {
      throw new BadRequestException('No se ha seleccionado un rol.');
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creación del usuario
    const newUser = await this.userRepository.save({
      ...userWithoutConfirmation,
      email,
      password: hashedPassword,
      roles: [role],
      img: '',
      isActive: false, // Usuario inactivo hasta completar pago
    });

    // Creación de sesión de pago en Stripe
    const priceId = this.getStripePriceId(user.selectedPlan);
    const session = await this.stripeService.createCheckoutSession(
      priceId,
      newUser.id
    );

    // Registro de compra pendiente
    await this.purchasesService.createPendingPurchase(
      newUser.id,
      (session.amount_total ?? 0) / 100, // Convertir de centavos
      session.id,
    );

    // Excluir contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = newUser;
    await sendEmail(newUser.email, "Bienvenido a GeStocker", "welcome", {name: newUser.name});
    return {
      user: userWithoutPassword,
      checkoutUrl: session.url ?? '',
    };
  }

  async login(
    credentials: LoginAuthDto,
  ): Promise<{
    requiresSubscription: boolean;
    checkoutUrl?: string;
    user: any;
    success: string;
    token: string;
  }> {
    const { email, password } = credentials;
  
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'roles', 'isActive'],
    });
  
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
  
    // Generar token siempre (para mantener sesión)
    const token = this.generateJwtToken(user);
  
    if (!user.isActive) {
      // Buscar suscripción pendiente
      const pendingPurchase = await this.purchasesService.getPendingPurchase(user.id);
      
      if (!pendingPurchase) {
        throw new UnauthorizedException('No se encontró una suscripción pendiente');
      }
  
      // Obtener URL de checkout existente
      const checkoutUrl = await this.stripeService.getCheckoutSessionUrl(
        pendingPurchase.stripeSessionId
      );

      if (!checkoutUrl) {
        throw new BadRequestException('No se pudo obtener la URL de checkout');
      }
  
      return {
        requiresSubscription: true,
        checkoutUrl,
        user: {
          id: user.id,
          email: user.email,
          roles: user.roles,
        },
        success: 'Complete su suscripción para acceder',
        token,
      };
    }
  
    return {
      requiresSubscription: false,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
      success: 'Inicio de sesión exitoso',
      token,
    };
  }

  // auth.service.ts
async loginWithGoogle(
  profile: any,
  selectedPlan: string // Nuevo parámetro
): Promise<{ success: string; token: string; checkoutUrl?: string }> {
  const { email, firstName, lastName, picture } = profile;
  let isNewUser = false;

  let user = await this.userRepository.findOne({
    where: { email },
    select: ['id', 'email', 'roles', 'isActive'],
  });

  if (!user) {
    user = await this.userRepository.save({
      name: `${firstName} ${lastName}`,
      email,
      img: picture,
      roles: [UserRole.BASIC],
      isActive: false,
    });
    isNewUser = true;
  }

  const token = this.generateJwtToken(user);

  if (isNewUser) {
    const priceId = this.getStripePriceId(selectedPlan); // Usar el plan seleccionado
    
    const session = await this.stripeService.createCheckoutSession(
      priceId,
      user.id
    );

    await this.purchasesService.createPendingPurchase(
      user.id,
      (session.amount_total ?? 0) / 100,
      session.id,
    );

    return {
      success: 'Por favor complete su suscripción',
      token,
      checkoutUrl: session.url ?? undefined,
    };
  }

  if (!user.isActive) {
    throw new UnauthorizedException('Complete su suscripción para acceder');
  }

  return {
    success: 'Inicio de sesión exitoso',
    token,
  };
}

  private generateJwtToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload, { expiresIn: '12h' });
  }

  private getStripePriceId(selectedPlan: string): string {
    const planPriceIds = {
      basic: this.configService.get('STRIPE_BASIC_PRICE_ID'),
      professional: this.configService.get('STRIPE_PROFESSIONAL_PRICE_ID'),
      business: this.configService.get('STRIPE_BUSINESS_PRICE_ID')
    };
  
    if (!planPriceIds[selectedPlan]) {
      throw new BadRequestException('Plan seleccionado no válido');
    }
  
    return planPriceIds[selectedPlan];
  }

  async validateUser(payload: any): Promise<User| null> {
    return this.userRepository.findOneBy({ id: payload.id });
  }
}