import { CategoriesBusiness } from 'src/modules/categories-bussines/entities/categories-business.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Bussines {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name: string;
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  direction: string;

  @ManyToOne(() => User, (user) => user.businesses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CategoriesBusiness, (category) => category.business)
  @JoinColumn({ name: 'businessCategory_id' })
  category: CategoriesBusiness;
}
