import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesBusinessService } from './categories-business.service';

describe('CategoriesBusinessService', () => {
  let service: CategoriesBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesBusinessService],
    }).compile();

    service = module.get<CategoriesBusinessService>(CategoriesBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
