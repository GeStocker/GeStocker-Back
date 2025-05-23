import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Business } from 'src/modules/bussines/entities/bussines.entity';
import { UserRole } from 'src/interfaces/roles.enum';
import { PurchaseLog } from 'src/modules/payments/entities/payment.entity';
import { PasswordResetToken } from 'src/modules/verification-codes/entities/verification-code.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  country?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  city?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  address: string;

  @CreateDateColumn()
  createdAt: string;

  @Column({ type: 'simple-array', default: [UserRole.BASIC] })
  roles: UserRole[]

  @Column({
    type: 'text',
    nullable: true,
    default: 'https://res.cloudinary.com/dikjpvebs/image/upload/v1744249705/fd3d8e2a1dd4f09b4170d31e26913bab_btnduh.jpg'
  })
  img: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'text', nullable: true })
  banReason?: string;

  @OneToMany(() => Business, (business) => business.user)
  @JoinColumn({ name: 'buisiness_id' })
  businesses: Business[];

  @OneToMany(() => PasswordResetToken, (prt) => prt.user)
  passwordResetTokens: PasswordResetToken[];

  @OneToMany(() => PurchaseLog, (payment) => payment.user)
  payments: PurchaseLog[];

}
