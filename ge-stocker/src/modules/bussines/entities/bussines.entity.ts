import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bussines {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  Direccion: string;
}
