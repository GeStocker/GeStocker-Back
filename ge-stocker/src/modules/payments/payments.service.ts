// src/payments/purchases.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
}