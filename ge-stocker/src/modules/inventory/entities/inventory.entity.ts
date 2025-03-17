import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;
    
    @Column()
    description: string;

    @Column()
    fechaDeCreacion: Date;

}
