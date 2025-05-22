import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';
import { InventoryProductsService } from '../inventory-products/inventory-products.service';
import { IncomingShipmentService } from '../incoming-shipment/incoming-shipment.service';
import { IncomingProduct } from '../incoming-shipment/entities/incoming-products.entity';

type InventoryExportRow = {
  Name: string;
  Description: string;
  Category: string;
  Stock: number;
  'Purchase Price': number;
  'Selling Price': number;
};

@Injectable()
export class ExcelExportInventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly incomingShipmentService: IncomingShipmentService,
    private readonly inventoryProductsService: InventoryProductsService,
    @InjectRepository(IncomingProduct)
    private readonly incomingProductRepository: Repository<IncomingProduct>,
  ) {}

  async exportInventoryToExcel(inventoryId: string): Promise<Buffer> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });

    if (!inventory) {
      throw new Error('Inventario no encontrado.');
    }

    const inventoryProducts = await this.inventoryProductsService.findByInventoryId(inventoryId);

    const data: InventoryExportRow[] = [];

    for (const ip of inventoryProducts) {
      const latestIncoming = await this.incomingProductRepository.findOne({
        where: { inventoryProduct: { id: ip.id } },
        // Orden por nombre del producto, no por fecha
        order: { name: 'ASC' },
      });

      data.push({
        Name: ip.product.name,
        Description: ip.product.description,
        Category: ip.product.category?.name || '',
        Stock: ip.stock,
        'Purchase Price': latestIncoming?.purchasePrice ?? 0,
        'Selling Price': ip.price,
      });
    }

    // Ordenar por nombre antes de exportar
    data.sort((a, b) => a.Name.localeCompare(b.Name));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
