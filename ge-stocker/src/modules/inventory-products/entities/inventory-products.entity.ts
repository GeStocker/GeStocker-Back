import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Inventory } from "../../inventory/entities/inventory.entity";
import { Product } from "../../products/entities/product.entity";
import { OutgoingProduct } from "src/modules/outgoing-product/entities/outgoing-product.entity";
import { IncomingProduct } from "src/modules/incoming-shipment/entities/incoming-products.entity";

@Entity('inventory_products')
export class InventoryProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => Inventory, inventory => inventory.inventoryProducts)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @ManyToOne(() => Product, (product) => product.inventoryProducts)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => OutgoingProduct, (outgoingProduct) => outgoingProduct.inventoryProduct)
  outgoingProducts: OutgoingProduct[];
  
  @OneToMany(() => IncomingProduct, (incomingProduct) => incomingProduct.inventoryProduct)
  incomingProducts: IncomingProduct[];
}