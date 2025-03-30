import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../../interfaces/roles.enum';
import { JwtService } from '@nestjs/jwt';
import { StripeService } from '../payments/stripe.service';
import { PurchasesService } from '../payments/payments.service';
import { ConfigService } from '@nestjs/config';

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
    const priceId = this.getStripePriceId(selectedPlan);
    const session = await this.stripeService.createCheckoutSession(
      priceId,
      newUser.id,
    );

    // Registro de compra pendiente
    await this.purchasesService.createPendingPurchase(
      newUser.id,
      (session.amount_total ?? 0) / 100, // Convertir de centavos
      session.id,
    );

    // Excluir contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      checkoutUrl: session.url ?? '',
    };
  }

  async login(
    credentials: LoginAuthDto,
  ): Promise<{
    requiresSubscription: any;
    checkoutUrl: any;
    user: any; success: string; token: string 
}> {
    const { email, password } = credentials;

    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'roles', 'isActive'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // Verificar si el usuario completó el pago
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Por favor complete su suscripción para acceder.',
      );
    }

    // Generar token JWT
    const token = this.generateJwtToken(user);

    return {
      requiresSubscription: null, // Adjust as needed
      checkoutUrl: null, // Adjust as needed
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
      success: 'Inicio de sesión exitoso',
      token,
    };
  }

  async loginWithGoogle(
    profile: any,
  ): Promise<{ success: string; token: string; checkoutUrl?: string }> {
    const { email, firstName, lastName, picture } = profile;
    let isNewUser = false;

    // Buscar o crear usuario
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

    // Generar token JWT
    const token = this.generateJwtToken(user);

    // Para nuevos usuarios, crear sesión de pago
    if (isNewUser) {
      const priceId = this.configService.get('STRIPE_DEFAULT_PRICE_ID');
      const session = await this.stripeService.createCheckoutSession(
        priceId,
        user.id,
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

    // Para usuarios existentes, verificar suscripción activa
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Por favor complete su suscripción para acceder.',
      );
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

  private getStripePriceId(planType: string): string {
    const plans = {
      monthly: this.configService.get('STRIPE_MONTHLY_PRICE_ID'),
      yearly: this.configService.get('STRIPE_YEARLY_PRICE_ID'),
    };

    if (!plans[planType]) {
      throw new BadRequestException('Tipo de plan no válido');
    }

    return plans[planType];
  }

  async validateUser(payload: any): Promise<User| null> {
    return this.userRepository.findOneBy({ id: payload.id });
  }
}