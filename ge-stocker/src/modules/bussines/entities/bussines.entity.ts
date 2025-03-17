import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bussines {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  direction: string;

  @ManyToOne(() => User, (user) => user.businesses)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
  