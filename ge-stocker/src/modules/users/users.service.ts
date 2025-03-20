import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateAuthDto } from '../auth/dto/update-auth.dto';

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    const userFound =  await this.userRepository.findOne({where: {id}});
    if(!userFound){
      throw new NotFoundException('Usuario no encontrado')
    }
    const { password, ...userWithoutPass } = userFound;
    return userWithoutPass
  }

  async update(id: string, updateUserDto: UpdateAuthDto) {
    const userFound = await this.userRepository.findOne({where:{id}});

    if(!userFound){
      throw new NotFoundException('Usuario no encontrado')
    }

    Object.assign(userFound, updateUserDto)
    await this.userRepository.save(userFound)
    return 'Usuario correctamente modificado'
  }

  async desactiveUser(id: string) {
    const userFound = await this.userRepository.findOne({where:{id}});
    if(!userFound){
      throw new NotFoundException('Usuario no encontrado')
    }

    userFound.isActive = false;
    await this.userRepository.save(userFound);

    return 'Tu cuenta fue eliminada con éxito'
  }
}
