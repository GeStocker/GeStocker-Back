import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CloudinaryRepository } from './files.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [FilesController],
  providers: [FilesService, CloudinaryRepository],
  exports: [FilesService, CloudinaryRepository]
})
export class FilesModule {}
