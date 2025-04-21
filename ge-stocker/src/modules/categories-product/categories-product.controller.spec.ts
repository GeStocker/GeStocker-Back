import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesProductController } from './categories-product.controller';
import { CategoriesProductService } from './categories-product.service';

describe('CategoriesProductController', () => {
  let controller: CategoriesProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesProductController],
      providers: [CategoriesProductService],
    }).compile();

    controller = module.get<CategoriesProductController>(CategoriesProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
