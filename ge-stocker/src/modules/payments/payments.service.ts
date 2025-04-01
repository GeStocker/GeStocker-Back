// src/payments/purchases.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod, PurchaseLog, PaymentStatus } from '../payments/entities/payment.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/interfaces/roles.enum';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';

@Injectable()
export class PurchasesService {
    constructor(
        @InjectRepository(PurchaseLog)
        private purchaseLogRepository: Repository<PurchaseLog>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private readonly configService: ConfigService,
        private stripeService: StripeService,
    ) { }

    async createPendingPurchase(userId: string, amount: number, sessionId: string) {
        const user = await this.usersRepository.findOneBy({ id: userId });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        const purchase = this.purchaseLogRepository.create({
            user,
            amount,
            paymentMethod: PaymentMethod.CARD,
            status: PaymentStatus.PENDING,
            stripeSessionId: sessionId,
            expirationDate,
        });

        return this.purchaseLogRepository.save(purchase);
    }

    // purchases.service.ts
async completePurchase(sessionId: string) {
    const purchase = await this.purchaseLogRepository.findOne({
        where: { stripeSessionId: sessionId, status: PaymentStatus.PENDING },
        relations: ['user'],
    });
    
    if (!purchase) throw new NotFoundException('Compra no encontrada');

    // Obtener sesión de Stripe con expand
    const session = await this.stripeService.retrieveCheckoutSession(sessionId);
    
    // Verificar que existe el priceId
    const priceId = session.line_items?.data[0]?.price?.id;
    if (!priceId) {
        throw new BadRequestException('No se pudo determinar el plan adquirido');
    }

    // Mapear priceId a rol
    const role = this.getRoleFromPriceId(priceId);

    // Actualizar usuario
    const user = purchase.user;
    user.roles = [role];
    user.isActive = true;

    // Actualizar compra
    purchase.status = PaymentStatus.COMPLETED;
    purchase.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.usersRepository.save(user);
    return this.purchaseLogRepository.save(purchase);
}

private getRoleFromPriceId(priceId: string): UserRole {
    const priceMap = {
        [this.configService.get('STRIPE_BASIC_PRICE_ID')]: UserRole.BASIC,
        [this.configService.get('STRIPE_PROFESSIONAL_PRICE_ID')]: UserRole.PROFESIONAL,
        [this.configService.get('STRIPE_BUSINESS_PRICE_ID')]: UserRole.BUSINESS
    };

    const role = priceMap[priceId];
    
    if (!role) {
        throw new BadRequestException(`Price ID ${priceId} no está configurado`);
    }

    return role;
}

async updateSubscription(subscriptionId: string, newPriceId: string) {
    // 1. Obtener la suscripción actual
    const purchase = await this.purchaseLogRepository.findOne({
        where: { stripeSubscriptionId: subscriptionId, status: PaymentStatus.COMPLETED },
        relations: ['user']
    });

    if (!purchase) {
        throw new NotFoundException('Suscripción no encontrada');
    }

    // 2. Validar nuevo plan
    const newRole = this.getRoleFromPriceId(newPriceId);
    if (newRole === purchase.user.roles[0]) {
        throw new ConflictException('El usuario ya tiene este plan activo');
    }

    // 3. Actualizar suscripción en Stripe
    const subscription = await this.stripeService.updateSubscription(
        subscriptionId,
        newPriceId
    );

    // 4. Calcular diferencia de precios
    const newPrice = await this.stripeService.getPriceAmount(newPriceId);
    
    // 5. Actualizar registro local
    purchase.amount = newPrice;
    purchase.paymentMethod = PaymentMethod.CARD;
    purchase.expirationDate = new Date(subscription.current_period_end * 1000);
    purchase.stripeSubscriptionId = subscription.id;

    // 6. Actualizar usuario
    const user = purchase.user;
    user.roles = [newRole];

    await this.usersRepository.save(user);
    return this.purchaseLogRepository.save(purchase);
}

async cancelSubscription(subscriptionId: string, immediate: boolean = false) {
    // 1. Obtener suscripción
    const purchase = await this.purchaseLogRepository.findOne({
        where: { stripeSubscriptionId: subscriptionId, status: PaymentStatus.COMPLETED },
        relations: ['user']
    });

    if (!purchase) {
        throw new NotFoundException('Suscripción no encontrada');
    }

    const user = await this.usersRepository.findOne({where: { id: purchase.user.id }});
    if (!user) {
        throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Cancelar en Stripe
    const canceledSubscription = await this.stripeService.cancelSubscription(
        subscriptionId,
        immediate
    );

    

    // 3. Actualizar estado
    user.isActive = false;
    purchase.status = PaymentStatus.CANCELED;
    purchase.expirationDate = new Date(canceledSubscription.current_period_end * 1000);

    // 4. Si es inmediato, desactivar usuario
    if (immediate) {
        const user = purchase.user;
        user.isActive = false;
        user.roles = [UserRole.BASIC];
        await this.usersRepository.save(user);
    }

    return this.purchaseLogRepository.save(purchase);
}

async getPendingPurchase(userId: string): Promise<PurchaseLog> {
    const purchase = await this.purchaseLogRepository.findOne({
      where: {
        user: { id: userId },
        status: PaymentStatus.PENDING
      },
      order: { purchaseDate: 'DESC' }
    });
  
    if (!purchase) {
      throw new NotFoundException('No existe una suscripción pendiente');
    }
  
    return purchase;
  }

// Helper methods
async getActiveSubscription(userId: string) {
    return this.purchaseLogRepository.findOne({
        where: { user: { id: userId }, status: PaymentStatus.COMPLETED },
        order: { purchaseDate: 'DESC' }
    });
}

async getSubscriptionByStripeId(subscriptionId: string) {
    return this.purchaseLogRepository.findOne({
        where: { stripeSubscriptionId: subscriptionId }
    });
}
}