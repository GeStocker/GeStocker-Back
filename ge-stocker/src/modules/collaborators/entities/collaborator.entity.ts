import { UserRole } from "src/interfaces/roles.enum";
import { Inventory } from "src/modules/inventory/entities/inventory.entity";
import { Column, Entity, In, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'collaborators' })
export class Collaborator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  email: string;
    
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string;

  @Column({default: true})
  isActive: boolean;
  
  @Column({default: false})
  isAdmin: boolean;

  @ManyToOne(() => Inventory, (inventory) => inventory.collaborators)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;
}
