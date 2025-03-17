import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesNegocioService } from './categories-negocio.service';

describe('CategoriesNegocioService', () => {
  let service: CategoriesNegocioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesNegocioService],
    }).compile();

    service = module.get<CategoriesNegocioService>(CategoriesNegocioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
