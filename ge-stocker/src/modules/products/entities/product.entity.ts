import { Business } from "src/modules/bussines/entities/bussines.entity";
import { CategoriesProduct } from "src/modules/categories-product/entities/categories-product.entity";
import { InventoryProduct } from "src/modules/inventory-products/entities/inventory-products.entity";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";

@Entity({
    name: 'products'
})
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true,
        nullable: false
    })
    name: string;

    @Column({
        type: 'text',
        nullable: false
    })
    description: string;

    @Column({
        type: 'text',
        nullable: false,
        default: 'https://res.cloudinary.com/dikjpvebs/image/upload/v1744249705/fd3d8e2a1dd4f09b4170d31e26913bab_btnduh.jpg'
    })
    img: string;

    @Column( { default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: string;

    @ManyToOne(() => Business, (business) => business.products)
    @JoinColumn({ name: 'business_id' })
    business: Business;

    @ManyToOne(() => CategoriesProduct, category => category.product)
    @JoinColumn({ name: 'productCategory_id' })
    category: CategoriesProduct;

    @OneToMany(() => InventoryProduct, (inventoryProduct) => inventoryProduct.product)
    inventoryProducts: InventoryProduct[];
}
