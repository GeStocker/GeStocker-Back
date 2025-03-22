import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Business } from '../bussines/entities/bussines.entity';
import { Product } from '../products/entities/product.entity';
import { FilesService } from '../files/files.service';
import { CloudinaryRepository } from '../files/files.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Business, Product])],
  controllers: [UsersController],
  providers: [UsersService, FilesService, CloudinaryRepository],
})
export class UsersModule {}
