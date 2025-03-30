// src/modules/payments/entities/payment-session.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class PaymentSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sessionId: string;

    @ManyToOne(() => User)
    user: User;

    @Column({ default: 'PENDING' })
    status: 'PENDING' | 'COMPLETED' | 'FAILED';

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt?: Date; // Añadir esta columna
}