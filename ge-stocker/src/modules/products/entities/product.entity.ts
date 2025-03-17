import { CategoriesProduct } from "src/modules/categories-product/entities/categories-product.entity";
import { Inventory } from "src/modules/inventory/entities/inventory.entity";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, ManyToOne, In, JoinColumn } from "typeorm";

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

    @Column({
        type: 'text',
        nullable: false,
        default: 'default-image-url.png'
    })
    img: string;

    @CreateDateColumn()
    createdAt: string;

    @ManyToOne(() => Inventory, inventory => inventory.products)
    inventory: Inventory;

    @ManyToOne(() => CategoriesProduct, category => category.product)
    @JoinColumn({ name: 'productCategory_id' })
    category: CategoriesProduct;
}
