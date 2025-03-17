import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

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