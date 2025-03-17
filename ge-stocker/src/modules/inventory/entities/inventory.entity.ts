import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  fechaDeCreacion: Date;

  @ManyToOne(() => User, (user) => user.inventories)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
