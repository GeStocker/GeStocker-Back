import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateAuthDto } from '../auth/dto/update-auth.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: FilesService
  ) {}

  async findOne(id: string) {
    const userFound =  await this.userRepository.findOne({where: {id}, relations: ['purchase_log ']});
    if(!userFound){
      throw new NotFoundException('Usuario no encontrado')
    }
    const { password, ...userWithoutPass } = userFound;
    return userWithoutPass
  }

  async update(id: string, updateUserDto: UpdateAuthDto, file?: Express.Multer.File) {
    const userFound = await this.userRepository.findOne({where:{id}});

    if(!userFound){
      throw new NotFoundException('Usuario no encontrado')
    }

    if (file) {
      const uploadResult = await this.cloudinaryService.updateUserImage(file, userFound.id);
      updateUserDto['img'] = uploadResult.secure_url;
    };

    Object.assign(userFound, updateUserDto)
    await this.userRepository.save(userFound)
    return 'Usuario correctamente modificado'
  }
}
