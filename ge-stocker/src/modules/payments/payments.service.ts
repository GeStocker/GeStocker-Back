// src/payments/purchases.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod, PurchaseLog, PaymentStatus } from '../payments/entities/payment.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/interfaces/roles.enum';

@Injectable()
export class PurchasesService {
    constructor(
        @InjectRepository(PurchaseLog)
        private purchaseLogRepository: Repository<PurchaseLog>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
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

    async completePurchase(sessionId: string) {
        const purchase = await this.purchaseLogRepository.findOne({
            where: { stripeSessionId: sessionId, status: PaymentStatus.PENDING },
            relations: ['user'],
        });
        if (!purchase) throw new NotFoundException('Compra no encontrada');

        purchase.status = PaymentStatus.COMPLETED;
        purchase.expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const user = purchase.user;
        user.roles = [UserRole.PROFESIONAL];
        await this.usersRepository.save(user);

        return this.purchaseLogRepository.save(purchase);
    }

    async getPendingSubscription(userId: string) {
        return this.purchaseLogRepository.findOne({
            where: {
                user: { id: userId },
                status: PaymentStatus.PENDING
            },
            order: { purchaseDate: 'DESC' }
        });
    }
}