import { Business } from "src/modules/bussines/entities/bussines.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity ({
    name: 'categories_product',
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

    @ManyToOne(() => Business, (business) => business.categories)
    @JoinColumn({ name: 'business_id' })
    business: Business;
}
