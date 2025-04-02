// src/payments/entities/purchase-log.entity.ts
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

export enum PaymentMethod {
    CARD = 'card',
}

export enum PaymentStatus {
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
    @JoinColumn({ name: 'user_id'})
    user: User;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CARD })
    paymentMethod: PaymentMethod;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column()
    stripeSessionId: string;

    @CreateDateColumn()
    purchaseDate: Date;

    @Column()
    expirationDate: Date;

    @Column({ nullable: true })
    stripeSubscriptionId: string;
}