import { Bussines } from 'src/modules/bussines/entities/bussines.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import {
  JoinColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Inventory {
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
  description: string;

  @CreateDateColumn()
  createdAt: Date;

 @ManyToOne(() => Bussines, (bussines) => bussines.inventories)
 @JoinColumn({ name: 'bussines_id' })
  business: Bussines;

  @OneToMany(() => Product, (product) => product.inventory)
  products: Product[];
}
