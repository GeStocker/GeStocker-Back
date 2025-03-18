import { Business } from 'src/modules/bussines/entities/bussines.entity';
import { InventoryProduct } from 'src/modules/inventory-products/entities/inventory-products.entity';
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

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  adress: string;

  @CreateDateColumn()
  createdAt: Date;

 @ManyToOne(() => Business, (bussines) => bussines.inventories)
 @JoinColumn({ name: 'bussines_id' })
  business: Business;

  @OneToMany(() => InventoryProduct, (inventoryProduct) => inventoryProduct.inventory)
  inventoryProducts: InventoryProduct[];
}
