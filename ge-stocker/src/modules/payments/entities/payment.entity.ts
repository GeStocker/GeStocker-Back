import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { SubscriptionPlan } from '../../../interfaces/subscriptions.enum';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ length: 3 })
    currency: string;

    @Column()
    status: string;

    @Column({ name: 'stripe_payment_id' })
    stripePaymentId: string;

    @Column({ name: 'invoice_url', nullable: true })
    invoiceUrl?: string;

    @Column({
        type: 'enum',
        enum: SubscriptionPlan,
        enumName: 'subscription_plan_enum'
    })
    plan: SubscriptionPlan;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.payments)
    user: User;
}