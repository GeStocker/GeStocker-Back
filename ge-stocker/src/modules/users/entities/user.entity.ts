import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Business } from 'src/modules/bussines/entities/bussines.entity';
import { UserRole } from 'src/interfaces/roles.enum';

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
    nullable: false,
  })
  password: string;

  @Column({
    type: 'bigint',
  })
  phone: number;

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
  })
  address: string;

  @CreateDateColumn()
  createdAt: string;

  @Column({ type: 'simple-array' })
  role: UserRole[]

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Business, (business) => business.user)
  @JoinColumn({ name: 'buisiness_id' })
  businesses: Business[];

}
