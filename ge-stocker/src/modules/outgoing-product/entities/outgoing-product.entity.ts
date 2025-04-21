import { InventoryProduct } from "src/modules/inventory-products/entities/inventory-products.entity";
import { LostProducts } from "src/modules/lost-products/entities/lost-product.entity";
import { SalesOrder } from "src/modules/sales-order/entities/sales-order.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OutgoingProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    salePrice?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalSalePrice?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    lossByUnit?: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalProductLoss?: number;

    @Column({ type: 'text', nullable: true })
    reason?: string;

    @ManyToOne(() => InventoryProduct, (inventoryProduct) => inventoryProduct.outgoingProducts)
    @JoinColumn({ name: 'inventoryProduct_id' })
    inventoryProduct: InventoryProduct;
    
    @ManyToOne(() => SalesOrder, (salesOrder) => salesOrder.outgoingProducts, { nullable: true })
    @JoinColumn({ name: 'salesOrder_id' })
    salesOrder?: SalesOrder;

    @ManyToOne(() => LostProducts, (lostProduct) => lostProduct.outgoingProducts, { nullable: true })
    @JoinColumn({ name: 'lostProduct_id' })
    lostProduct?: LostProducts;
}
