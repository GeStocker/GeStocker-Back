import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Repository } from 'typeorm';
import { Business } from '../bussines/entities/bussines.entity';
import { User } from '../users/entities/user.entity';
import { Collaborator } from '../collaborators/entities/collaborator.entity';
import { CustomRequest } from 'src/interfaces/custom-request.interface';
import { UserRole } from 'src/interfaces/roles.enum';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
  ) {}

  async createInventory(createInventoryDto: CreateInventoryDto, businessId: string, userId: string): Promise<Inventory> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    const { roles } = user;

    const inventoryCount = await this.inventoryRepository.count({ where: { business: { id: businessId } } });

    let maxInventories = 0;
    if (roles.includes(UserRole.BASIC)) {
      maxInventories = 1;
    } else if (roles.includes(UserRole.PROFESIONAL)) {
      maxInventories = 5;
    } else if (roles.includes(UserRole.BUSINESS)) {
      maxInventories = Infinity;
    };
    
    if (inventoryCount >= maxInventories) throw new ForbiddenException(`No puedes crear mas de ${maxInventories} inventarios por negocio en tu plan actual.`);
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) throw new NotFoundException('Business not found');

    const newInventory = this.inventoryRepository.create({
      ...createInventoryDto,
      business,
    });

    return await this.inventoryRepository.save(newInventory);
  }

  async getInventories(): Promise<Inventory[]> {
    const inventories = await this.inventoryRepository.find({ relations: ['business'] });
    if(inventories.length === 0) throw new NotFoundException('No inventories found');
    return inventories;
  }

  async getBusinessInventories(businessId: string) {
    const inventories = await this.inventoryRepository.find({
      where: { business: { id: businessId } },
    });

    return inventories;
  }

  async getInventoryById(id: string, request: CustomRequest): Promise<Inventory> {
    const { user } = request;

    const owner = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (owner) {
      const inventory = await this.inventoryRepository.findOne({
        where: { id, business: { user: { id: owner.id } } },
        relations: ['business'],
      });
      if (inventory) return inventory;
    };
    
    const collaborator = await this.collaboratorRepository.findOne({
      where: { id: user.id, inventory: { id } },
      relations: ['inventory'],
    });
    
    if (collaborator) return collaborator.inventory; 

    throw new ForbiddenException('No tienes acceso a este inventario');
  }

  async updateInventory(id: string, updateInventoryDto: UpdateInventoryDto, businessId: string): Promise<Inventory> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
    });

    if (!business) throw new NotFoundException('Business not found');

    const inventory = await this.inventoryRepository.preload({
      id,
      ...updateInventoryDto,
    });

    if (!inventory) throw new NotFoundException(`Inventory not found`);

    return await this.inventoryRepository.save(inventory);
  }

  async removeInventory(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
    });
    if (!inventory) throw new NotFoundException(`Inventory not found`);
  
    inventory.isActive = false;
    return await this.inventoryRepository.save(inventory);
  }
}