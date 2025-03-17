import { Product } from "src/modules/products/entities/product.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity ({
    name: 'CATEGORIES_PRODUCTS'
})
export class CategoriesProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    name: string;

    @OneToMany(() => Product, (product) => product.category)
    product: Product[];
}
