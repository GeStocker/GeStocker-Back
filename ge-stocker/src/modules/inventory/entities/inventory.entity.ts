import { Business } from 'src/modules/bussines/entities/bussines.entity';
import { Collaborator } from 'src/modules/collaborators/entities/collaborator.entity';
import { IncomingShipment } from 'src/modules/incoming-shipment/entities/incoming-shipment.entity';
import { InventoryProduct } from 'src/modules/inventory-products/entities/inventory-products.entity';
import { LostProducts } from 'src/modules/lost-products/entities/lost-product.entity';
import { SalesOrder } from 'src/modules/sales-order/entities/sales-order.entity';
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
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Business, (bussines) => bussines.inventories)
  @JoinColumn({ name: 'bussines_id' })
  business: Business;

  @OneToMany(() => InventoryProduct, (inventoryProduct) => inventoryProduct.inventory)
  inventoryProducts: InventoryProduct[];

  @OneToMany(() => IncomingShipment, (incomingShipment) => incomingShipment.inventory)
  incomingShipments: IncomingShipment[];

  @OneToMany(() => Collaborator, (collaborator) => collaborator.inventory)
  @JoinColumn({ name: 'collaborator_id' })
  collaborators: Collaborator[];

  @OneToMany(() => SalesOrder, (salesOrder) => salesOrder.inventory)
  salesOrders: SalesOrder[];

  @OneToMany(() => LostProducts, (lostProduct) => lostProduct.inventory)
  lostProducts: LostProducts[];
}
