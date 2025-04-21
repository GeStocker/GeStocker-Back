// src/payments/entities/purchase-log.entity.ts
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

export enum PaymentMethod {
    CARD = 'card',
    TRIAL = 'trial',
}

export enum PaymentStatus {
    TRIAL = 'trial',
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELED = 'canceled',
}

@Entity()
export class PurchaseLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.payments)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CARD })
    paymentMethod: PaymentMethod;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column({
        nullable: true
    })
    stripeSessionId: string;

    @CreateDateColumn()
    purchaseDate: Date;

    @Column({
        nullable: true,
    })
    expirationDate: Date;

    @Column({ nullable: true })
    stripeSubscriptionId: string;
}