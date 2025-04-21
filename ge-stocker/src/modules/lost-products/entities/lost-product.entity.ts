import { InventoryProduct } from "src/modules/inventory-products/entities/inventory-products.entity";
import { Inventory } from "src/modules/inventory/entities/inventory.entity";
import { OutgoingProduct } from "src/modules/outgoing-product/entities/outgoing-product.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('lost_products')
export class LostProducts {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalLoss: number;

    @CreateDateColumn()
    date: Date;

    @ManyToOne(() => Inventory, (inventory) => inventory.lostProducts)
    @JoinColumn({ name: 'inventory_id' })
    inventory: Inventory;

    @OneToMany(() => OutgoingProduct, (outgoingProduct) => outgoingProduct.lostProduct)
    outgoingProducts: OutgoingProduct[];
}   
