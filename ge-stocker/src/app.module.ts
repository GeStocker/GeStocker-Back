import { Module } from '@nestjs/common';
import { CategoriesBusinessModule } from './categories-bussines/categories-business.module';

@Module({
  imports: [CategoriesBusinessModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
