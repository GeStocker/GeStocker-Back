import { Collaborator } from "src/modules/collaborators/entities/collaborator.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'websocket'})
export class Websocket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Collaborator, {eager: true})
    @JoinColumn({name: 'sender_id'})
    sender: Collaborator

    @ManyToOne(() => Collaborator, {eager: true})
    @JoinColumn({name: 'receiver_id'})
    receiver: Collaborator
}
