import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business } from './entities/bussines.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/interfaces/roles.enum';


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

    if (!user) throw new NotFoundException('Usuario no encontrado');
 
    const { roles } = user;
 
    const businessCount = await this.businessRepository.count({ where: { user: { id: userId }, isActive: true } });
 
    let maxBusinesses = 0;
    if(roles.includes(UserRole.BASIC)) {
       maxBusinesses = 1;
    } else if (roles.includes(UserRole.PROFESIONAL)) {
       maxBusinesses = 3;
    } else if (roles.includes(UserRole.BUSINESS)) {
       maxBusinesses = Infinity;
    } else if (roles.includes(UserRole.SUPERADMIN)) {
       maxBusinesses = Infinity;
    }
 
    if(businessCount >= maxBusinesses) throw new ForbiddenException(`No puedes crear mas de ${maxBusinesses} negocios en tu plan actual`)

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
      relations: ['inventories', 'user'],
    });
  }

  async getUserBusinessById(businessId: string, userId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId, user: { id: userId } },
      relations: ['inventories', 'user'],
    });

    if(!business) throw new NotFoundException('Business not found or not accesible');

    return business;
  }

  async getBusinessOwnerId(businessId: string) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['user'],
    });
  
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }
  
    return { userId: business.user.id };
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
