import { Module } from '@nestjs/common';
import { BussinesService } from './bussines.service';
import { BussinesController } from './bussines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/bussines.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, User])],
  controllers: [BussinesController],
  providers: [BussinesService],
})
export class BussinesModule {}
