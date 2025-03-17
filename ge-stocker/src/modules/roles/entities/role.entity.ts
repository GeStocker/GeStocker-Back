import { User } from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false,
        unique: true
    })
    description: string;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}