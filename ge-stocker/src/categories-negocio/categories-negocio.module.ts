import { Module } from '@nestjs/common';
import { CategoriesNegocioService } from './categories-negocio.service';
import { CategoriesNegocioController } from './categories-negocio.controller';

@Module({
  controllers: [CategoriesNegocioController],
  providers: [CategoriesNegocioService],
})
export class CategoriesNegocioModule {}
