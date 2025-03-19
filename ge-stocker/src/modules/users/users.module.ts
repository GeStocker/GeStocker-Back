import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Business } from '../bussines/entities/bussines.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Business])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
