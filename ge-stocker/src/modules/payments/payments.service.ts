// src/payments/purchases.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod, PurchaseLog, PaymentStatus } from '../payments/entities/payment.entity';
import { Between, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/interfaces/roles.enum';
import { ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { sendEmail } from 'src/emails/config/mailer';
import { Cron } from '@nestjs/schedule';

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

    // src/payments/purchases.service.ts

    async completePurchase(sessionId: string) {
        const purchase = await this.purchaseLogRepository.findOne({
            where: { stripeSessionId: sessionId, status: PaymentStatus.PENDING },
            relations: ['user'],
        });

        if (!purchase) throw new NotFoundException('Compra no encontrada');

        const session = await this.stripeService.retrieveCheckoutSession(sessionId);

        // Obtener el ID de la suscripción desde la sesión de Stripe
        const subscriptionId = session.subscription as string; // Asegúrate de que session.subscription es el ID correcto
        if (!subscriptionId) {
            throw new BadRequestException('No se pudo obtener el ID de la suscripción');
        }

        const priceId = session.line_items?.data[0]?.price?.id;
        if (!priceId) {
            throw new BadRequestException('No se pudo determinar el plan adquirido');
        }

        const role = this.getRoleFromPriceId(priceId);

        const user = purchase.user;
        user.roles = [role];
        user.isActive = true;

        // Asignar el subscriptionId al purchase
        purchase.stripeSubscriptionId = subscriptionId;
        purchase.status = PaymentStatus.COMPLETED;
        purchase.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await sendEmail(
            user.email,
            "Bienvenido a GeStocker - Gracias por unirte a nosotros",
            "welcome",
            {
                name: user.name,
                plan: role,
                expirationDate: purchase.expirationDate.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
            }
        );

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

        const purchase = await this.purchaseLogRepository.findOne({
            where: { stripeSubscriptionId: subscriptionId, status: PaymentStatus.COMPLETED },
            relations: ['user']
        });

        if (!purchase) {
            throw new NotFoundException('Suscripción no encontrada');
        }

        const newRole = this.getRoleFromPriceId(newPriceId);
        if (newRole === purchase.user.roles[0]) {
            throw new ConflictException('El usuario ya tiene este plan activo');
        }

        const subscription = await this.stripeService.updateSubscription(
            subscriptionId,
            newPriceId
        );

        const newPrice = await this.stripeService.getPriceAmount(newPriceId);

        purchase.amount = newPrice;
        purchase.paymentMethod = PaymentMethod.CARD;
        purchase.expirationDate = new Date(subscription.current_period_end * 1000);
        purchase.stripeSubscriptionId = subscription.id;

        const user = purchase.user;
        user.roles = [newRole];

        await this.usersRepository.save(user);
        return this.purchaseLogRepository.save(purchase);
    }

    async cancelSubscription(id: string) {  // Cambia nombre del parámetro
        const purchase = await this.purchaseLogRepository.findOne({
            where: {
                id,  // Buscar por ID de tu entidad, no de Stripe
                status: PaymentStatus.COMPLETED
            },
            relations: ['user']
        });

        if (!purchase) {
            throw new NotFoundException('Suscripción no encontrada');
        }

        const user = purchase.user;
        user.isActive = false;
        purchase.status = PaymentStatus.PENDING;
        purchase.expirationDate = new Date();

        await this.usersRepository.save(user);
        return this.purchaseLogRepository.save(purchase);
    }

    @Cron('0 0 0 * * *')
    async handleExpiredSubscriptions() {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const aboutToExpire = await this.purchaseLogRepository.find({
            where: {
                status: PaymentStatus.COMPLETED,
                expirationDate: Between(startOfDay, endOfDay),
            },
            relations: ['user'],
        });

        for (const purchase of aboutToExpire) {
            const user = purchase.user;
            const role = user.roles[0];

            try {
                await sendEmail(
                    user.email,
                    "Tu suscripción está por vencer",
                    "fechaLimiteMembresia",
                    { role, name: user.name }
                );
            } catch (err) {
                throw new BadRequestException('Error al enviar el correo electrónico');
            }
        }
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