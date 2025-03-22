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
    default: 'https://res.cloudinary.com/dikjpvebs/image/upload/v1742661335/icon_dlepud.jpg'
  })
  img: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Business, (business) => business.user)
  @JoinColumn({ name: 'buisiness_id' })
  businesses: Business[];

}
