import { InventoryProduct } from "src/modules/inventory-products/entities/inventory-products.entity";
import { SalesOrder } from "src/modules/sales-order/entities/sales-order.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OutgoingProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    salePrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalSalePrice: number;

    @ManyToOne(() => InventoryProduct, (inventoryProduct) => inventoryProduct.outgoingProducts)
    inventoryProduct: InventoryProduct;
    
    @ManyToOne(() => SalesOrder, (salesOrder) => salesOrder.outgoingProducts, { nullable: true })
    salesOrder?: SalesOrder;
}
