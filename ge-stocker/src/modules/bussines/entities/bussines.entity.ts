import { CategoriesProduct } from 'src/modules/categories-product/entities/categories-product.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Business {
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
  address: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  description: string;

  @CreateDateColumn()
  createdAt: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.businesses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Inventory, (inventory) => inventory.business)
  @JoinColumn({ name: 'inventory_id' })
  inventories: Inventory[];

  @OneToMany(() => Product, (product) => product.business)
  products: Product[];

  @OneToMany(() => CategoriesProduct, (category) => category.business)
  categories: CategoriesProduct[];
}
