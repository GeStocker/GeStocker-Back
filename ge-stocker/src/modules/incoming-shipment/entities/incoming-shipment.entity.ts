import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IncomingProduct } from "./incoming-products.entity";
import { Inventory } from "src/modules/inventory/entities/inventory.entity";

@Entity({ name: 'incoming_shipments' })
export class IncomingShipment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    date: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalPrice: number;

    @OneToMany(() => IncomingProduct, (product) => product.shipment, {
        cascade: true,
    })
    products: IncomingProduct[];

    @ManyToOne(() => Inventory, (inventory) => inventory.incomingShipments)
    @JoinColumn({ name: 'inventory_id' })
    inventory: Inventory;
}