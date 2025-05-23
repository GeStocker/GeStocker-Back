import { Inventory } from "src/modules/inventory/entities/inventory.entity";
import { OutgoingProduct } from "src/modules/outgoing-product/entities/outgoing-product.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('sales_order')
export class SalesOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: "timestamptz" })
    date: Date;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discount: number;

    @Column({ type: 'text', nullable: true })
    customer?: string;

    @ManyToOne(() => Inventory, (inventory) => inventory.salesOrders)
    @JoinColumn({ name: 'inventory_id' })
    inventory: Inventory;

    @OneToMany(() => OutgoingProduct, (outgoingProduct) => outgoingProduct.salesOrder)
    outgoingProducts: OutgoingProduct[];
}
