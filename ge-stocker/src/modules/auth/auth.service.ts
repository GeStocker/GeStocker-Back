import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
  NotFoundException,
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
import { PasswordResetToken } from '../verification-codes/entities/verification-code.entity';
import { VerificationCodesService } from '../verification-codes/verification-codes.service';

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
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepo: Repository<PasswordResetToken>,
    private readonly emailService: VerificationCodesService,
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

    if (user.isBanned) throw new UnauthorizedException('El usuario ha sido baneado');

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

    // Buscar usuario incluyendo todos los campos relevantes
    let user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'roles', 'isActive', 'isBanned', 'name'],
    });

    // Crear nuevo usuario si no existe
    if (!user) {
      user = await this.userRepository.save({
        name: `${firstName} ${lastName}`,
        email,
        img: picture,
        roles: [UserRole.BASIC],
        isActive: false,
        isBanned: false,
      });
      isNewUser = true;
    }

    // Verificar si el usuario está baneado
    if (user.isBanned) {
      throw new UnauthorizedException('El usuario ha sido baneado');
    }

    // Validar plan seleccionado
    if (!selectedPlan) {
      return {
        success: isNewUser 
          ? 'Usuario nuevo, redirigiendo a registro' 
          : 'Selección de plan requerida',
        ...(isNewUser && {
          isNewUser: true,
          registerUrl: `${this.configService.get('FRONTEND_URL')}/register`
        })
      };
    }

    // Manejar prueba gratuita BASIC
    if (selectedPlan === SubscriptionPlan.BASIC) {
      // Verificar si ya tiene una prueba activa
      const existingTrial = await this.purchaseLogRepository.findOne({
        where: {
          user: { id: user.id },
          status: PaymentStatus.TRIAL
        }
      });

      if (!existingTrial) {
        const trialExpiration = new Date();
        trialExpiration.setDate(trialExpiration.getDate() + 7);

        await this.purchaseLogRepository.save({
          user,
          amount: 0,
          paymentMethod: PaymentMethod.TRIAL,
          status: PaymentStatus.TRIAL,
          expirationDate: trialExpiration,
        });

        await this.userRepository.update(user.id, { isActive: true });
        user.isActive = true;

        await sendEmail(
          user.email,
          "Bienvenido a GeStocker - Prueba Gratuita",
          "welcome",
          {
            name: user.name,
            trialEndDate: trialExpiration.toLocaleDateString(),
          }
        );
      }

      const token = this.generateJwtToken(user);
      return {
        success: 'Inicio de sesión exitoso',
        token,
      };
    }

    // Usuario ya activo
    if (user.isActive) {
      return {
        success: 'Inicio de sesión exitoso',
        token: this.generateJwtToken(user),
      };
    }

    // Flujo de pago para usuarios no activos
    const priceId = this.getStripePriceId(selectedPlan);
    const session = await this.stripeService.createCheckoutSession(priceId, user.id);
    
    await this.purchasesService.createPendingPurchase(
      user.id,
      (session.amount_total ?? 0) / 100,
      session.id
    );

    return {
      success: 'Por favor complete su suscripción',
      checkoutUrl: session.url ?? undefined,
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

  async validateUser(payload: any): Promise<User | null> {
    return this.userRepository.findOneBy({ id: payload.id });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return; // No revelar si el email existe

    // Eliminar códigos previos
    await this.passwordResetTokenRepo.delete({ user: { id: user.id } });

    const code = this.generate6DigitCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.passwordResetTokenRepo.save({
      user,
      code,
      expiresAt,
    });

    await this.emailService.sendPasswordResetCode(email, code);
  }

  private generate6DigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyCode(email: string, code: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const resetToken = await this.passwordResetTokenRepo.findOne({
      where: { user: { id: user.id }, code, used: false },
      order: { expiresAt: 'DESC' },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Código inválido o expirado');
    }

    resetToken.used = true;
    await this.passwordResetTokenRepo.save(resetToken);

    // Generar JWT para resetear contraseña
    return this.jwtService.sign(
      { sub: user.id, email: user.email, tokenType: 'passwordReset' },
      { expiresIn: '5m' },
    );
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
  }
}