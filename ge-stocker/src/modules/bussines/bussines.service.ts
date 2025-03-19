import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

  findAll() {
    return `This action returns all bussines`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bussine`;
  }

  update(id: number, updateBusinessDto: UpdateBusinessDto) {
    return `This action updates a #${id} bussine`;
  }

  remove(id: number) {
    return `This action removes a #${id} bussine`;
  }
}
