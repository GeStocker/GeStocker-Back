// src/auth/entities/password-reset-token.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.passwordResetTokens)
    user: User;

    @Column()
    code: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: false })
    used: boolean;
}
