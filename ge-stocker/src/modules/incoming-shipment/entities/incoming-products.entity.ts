import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IncomingShipment } from "./incoming-shipment.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { InventoryProduct } from "src/modules/inventory-products/entities/inventory-products.entity";

@Entity({ name: 'incoming_products' })
export class IncomingProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'int', nullable: false })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    purchasePrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    totalPrice: number;

    @ManyToOne(() => IncomingShipment, (shipment) => shipment.products)
    @JoinColumn({ name: 'incomingShipment_id' })
    shipment: IncomingShipment;

    @ManyToOne(() => InventoryProduct, { nullable: false })
    @JoinColumn({ name: 'inventoryProduct_id' })
    inventoryProduct: InventoryProduct;
}