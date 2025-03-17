import { Bussines } from "src/modules/bussines/entities/bussines.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity ({
    name: 'categories_business',
})
export class CategoriesBusiness {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    name: string;

    @OneToMany(() => Bussines, (business) => business.category)
    business: Bussines;
}
