import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Repository } from 'typeorm';
import { Business } from '../bussines/entities/bussines.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async createInventory(createInventoryDto: CreateInventoryDto, businessId: string): Promise<Inventory> {
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
    const inventories = await this.inventoryRepository.findOne({
      where: { business: { id: businessId } },
    });

    return inventories;
  }

  async getInventoryById(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({where: {id}, relations: ['business']});
    if (!inventory) throw new NotFoundException(`Inventory not found`);
    return inventory;
  }

  async updateInventory(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const { businessId } = updateInventoryDto;

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
    const inventory = await this.getInventoryById(id);
    if (!inventory) throw new NotFoundException(`Inventory not found`);
  
    inventory.isActive = false;
    return await this.inventoryRepository.save(inventory);
  }
}