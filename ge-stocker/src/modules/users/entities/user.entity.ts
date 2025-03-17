import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Role } from "src/modules/roles/entities/role.entity";
import { Inventory } from "src/modules/inventory/entities/inventory.entity";

@Entity({
    name: 'users'
})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column(
        {
            type: 'varchar',
            length: 50,
            nullable: false,
            unique: true
        }
    )
    email: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    password: string;

    @Column({
        type: 'bigint'
    })
    phone: number;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true
    })
    country?: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: true
    })
    city?: string;

    @Column({
        type: 'text'
    })
    address: string;

    @CreateDateColumn()
    createdAt: string;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role' })
    role: Role;

    @OneToMany(() => Inventory, (inventory) => inventory.user)
    @JoinColumn({ name: 'user_id' })
    inventories: Inventory[];
} 