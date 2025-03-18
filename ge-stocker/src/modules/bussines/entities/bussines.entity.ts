import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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

  @OneToMany(() => Inventory, (inventory) => inventory.business)
  @JoinColumn({ name: 'inventory_id' })
  inventories: Inventory[];
}
