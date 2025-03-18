import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Inventory } from "../../inventory/entities/inventory.entity";
import { Product } from "../../products/entities/product.entity";

@Entity('inventory_products')
export class InventoryProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Inventory, inventory => inventory.inventoryProducts)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @ManyToOne(() => Product, (product) => product.inventoryProducts)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    nullable: false
   })
  price: number;

  @Column({
    type: 'int', 
    nullable: false
  })
  stock: number;

  @CreateDateColumn()
  addedAt: Date;
}