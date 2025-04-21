import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesProductService } from './categories-product.service';

describe('CategoriesProductService', () => {
  let service: CategoriesProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesProductService],
    }).compile();

    service = module.get<CategoriesProductService>(CategoriesProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
