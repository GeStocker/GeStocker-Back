import { Controller } from '@nestjs/common';
import { InventoryProductsService } from './inventory-products.service';

@Controller('inventory-products')
export class InventoryProductsController {
  constructor(private readonly inventoryProductsService: InventoryProductsService) {}
}
