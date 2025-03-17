import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesBusinessController } from './categories-business.controller';
import { CategoriesBusinessService } from './categories-business.service';

describe('CategoriesBusinessController', () => {
  let controller: CategoriesBusinessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesBusinessController],
      providers: [CategoriesBusinessService],
    }).compile();

    controller = module.get<CategoriesBusinessController>(CategoriesBusinessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
