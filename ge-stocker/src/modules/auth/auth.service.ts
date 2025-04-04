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
import { PaymentMethod, PaymentStatus, PurchaseLog } from '../payments/entities/payment.entity';

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
    @InjectRepository(PurchaseLog)
    private readonly purchaseLogRepository: Repository<PurchaseLog>,
  ) { }

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

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Correo ya registrado.');
    }

    if (password !== passwordConfirmation) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    const role = roles[0];
    if (!role) {
      throw new BadRequestException('No se ha seleccionado un rol.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isBasicTrial = selectedPlan === SubscriptionPlan.BASIC;

    const newUser = await this.userRepository.save({
      ...userWithoutConfirmation,
      email,
      password: hashedPassword,
      roles: [role],
      img: '',
      isActive: isBasicTrial,
    });

    if (isBasicTrial) {
      const trialExpiration = new Date();
      trialExpiration.setDate(trialExpiration.getDate() + 7);

      const trialPurchase = this.purchaseLogRepository.create({
        user: newUser,
        amount: 0,
        paymentMethod: PaymentMethod.TRIAL,
        status: PaymentStatus.TRIAL,
        expirationDate: trialExpiration,
      });

      await this.purchaseLogRepository.save(trialPurchase);

      await sendEmail(
        newUser.email,
        "Bienvenido a GeStocker - Prueba Gratuita",
        "welcome",
        {
          name: newUser.name,
          trialEndDate: trialExpiration.toLocaleDateString()
        }
      );

      return {
        user: {
          ...newUser,
          password: undefined,
        },
        checkoutUrl: ''
      };
    }

    const priceId = this.getStripePriceId(selectedPlan);
    const session = await this.stripeService.createCheckoutSession(
      priceId,
      newUser.id
    );

    await this.purchasesService.createPendingPurchase(
      newUser.id,
      (session.amount_total ?? 0) / 100,
      session.id
    );

    await sendEmail(
      newUser.email,
      "Bienvenido a GeStocker",
      "welcome",
      { name: newUser.name }
    );

    return {
      user: {
        ...newUser,
        password: undefined,
      },
      checkoutUrl: session.url ?? ''
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

    const token = this.generateJwtToken(user);

    if (!user.isActive) {
      const pendingPurchase = await this.purchasesService.getPendingPurchase(user.id);

      if (!pendingPurchase) {
        throw new UnauthorizedException('No se encontró una suscripción pendiente');
      }

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

  async loginWithGoogle(
    profile: any,
    selectedPlan: string
  ): Promise<{
    success: string;
    token?: string;
    checkoutUrl?: string;
    isNewUser?: boolean;
    registerUrl?: string;
  }> {
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
        isActive: false, // Se actualizará si es trial
      });
      isNewUser = true;
    
      return {
        success: 'Usuario nuevo, redirigiendo a registro',
        isNewUser: true,
        registerUrl: `${this.configService.get('FRONTEND_URL')}/register`,
      };
    }
    // 🧪 Si eligió el plan BASIC, activar prueba gratuita
    const isBasicTrial = selectedPlan === SubscriptionPlan.BASIC;
    if (isBasicTrial) {
      const trialExpiration = new Date();
      trialExpiration.setDate(trialExpiration.getDate() + 7);
  
      const trialPurchase = this.purchaseLogRepository.create({
        user,
        amount: 0,
        paymentMethod: PaymentMethod.TRIAL,
        status: PaymentStatus.TRIAL,
        expirationDate: trialExpiration,
      });
  
      await this.purchaseLogRepository.save(trialPurchase);
  
      // ⚡ Activar usuario para evitar lógica de Stripe
      user.isActive = true;
      await this.userRepository.save(user);
  
      await sendEmail(
        user.email,
        "Bienvenido a GeStocker - Prueba Gratuita",
        "welcome",
        {
          name: user.name,
          trialEndDate: trialExpiration.toLocaleDateString(),
        }
      );
      const token = this.generateJwtToken(user);
      return {
        success: 'Inicio de sesión exitoso',
        token,
      };
    }
    const token = this.generateJwtToken(user);
    if (!user.isActive) {
      console.log(':círculo_rojo: Usuario no activo, redirigiendo a pago en Stripe');
      const priceId = this.getStripePriceId(selectedPlan);
      const session = await this.stripeService.createCheckoutSession(priceId, user.id);
      const pendingPurchase = await this.purchasesService.createPendingPurchase(
        user.id,
        (session.amount_total ?? 0) / 100,
        session.id
      );
      const checkoutUrl = await this.stripeService.getCheckoutSessionUrl(
        pendingPurchase.stripeSessionId
      );
      return {
        success: 'Por favor complete su suscripción',
        checkoutUrl: checkoutUrl ?? undefined,
      };
    }
    console.log(':marca_de_verificación_blanca: Usuario activo, iniciando sesión normalmente');
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
    console.log("plan elegido aaaaaaaa", selectedPlan)
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

  async validateUser(payload: any): Promise<User | null> {
    return this.userRepository.findOneBy({ id: payload.id });
  }
}