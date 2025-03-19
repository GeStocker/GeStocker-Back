import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business } from './entities/bussines.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';


@Injectable()
export class BussinesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async createBusiness(createBusinessDto: CreateBusinessDto, userId: string): Promise<Business> {
    const user = await this.userRepository.findOne({
      where: {id: userId}
    });

    if (!user) throw new NotFoundException('User not found');

    const businessExistance = await this.businessRepository.findOne({
      where: { name: createBusinessDto.name, user: { id: userId } },
    });

    if (businessExistance) throw new ConflictException('You already have a business with this name');

    const newBusiness = this.businessRepository.create({
      ...createBusinessDto,
      user,
    });

    return await this.businessRepository.save(newBusiness)
  }

  async getUserBusinesses(userId: string): Promise<Business[]> {
    return await this.businessRepository.find({
      where: { user: { id: userId } },
      relations: ['inventories'],
    });
  }

  async getUserBusinessById(businessId: string, userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId, user: { id: userId } },
      relations: ['inventories'],
    });

    if(!business) throw new NotFoundException('Business not found or not accesible');

    return business;
  }

  async updateBusiness(businessId: string, updateBusinessDto: UpdateBusinessDto, userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId, user: { id: userId } }
    });

    if (!business) throw new NotFoundException('Business not found or not accesible');

    if (business.user.id !== userId) throw new UnauthorizedException('You are not authorized to update this business');

    await this.businessRepository.update(businessId, updateBusinessDto);

    const updatedBusiness = await this.businessRepository.findOne({ where: { id: businessId } })

    if (!updatedBusiness) throw new NotFoundException('Business not found');

    return updatedBusiness;
  }

  async deactivateBusiness(businessId: string, userId: string): Promise<string> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId }
    });

    if (!business) throw new NotFoundException('Business not found or not accesible');

    if (business.user.id !== userId) throw new UnauthorizedException('You are not authorized to delete this business');

    business.isActive = false;
    await this.businessRepository.save(business);

    return "Your Business has been deleted!"
  }
}
