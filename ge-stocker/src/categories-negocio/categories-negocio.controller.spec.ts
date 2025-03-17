import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesNegocioController } from './categories-negocio.controller';
import { CategoriesNegocioService } from './categories-negocio.service';

describe('CategoriesNegocioController', () => {
  let controller: CategoriesNegocioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesNegocioController],
      providers: [CategoriesNegocioService],
    }).compile();

    controller = module.get<CategoriesNegocioController>(CategoriesNegocioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
