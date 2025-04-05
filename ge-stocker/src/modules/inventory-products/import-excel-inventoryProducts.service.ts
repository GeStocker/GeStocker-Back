import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ProductsService } from '../products/products.service';
import { InventoryProductsService } from '../inventory-products/inventory-products.service';
import { ImportInventoryProductDto } from './dto/create-import-InventoryProductDTO';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class ExcelImportInventoryService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly inventoryProductsService: InventoryProductsService,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async parseExcel(fileBuffer: Buffer): Promise<ImportInventoryProductDto[]> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    return rawData.map((row: any) => ({
      name: row['Name'],
      description: row['Description'],
      category: row['Category'],
      stock: Number(row['Stock']),
      price: Number(row['Price']),
    }));
  }

  async importInventoryProducts(
    fileBuffer: Buffer,
    userId: string,
    businessId: string,
  ): Promise<{ message: string }> {
    const parsedProducts = await this.parseExcel(fileBuffer);

    const inventory = await this.inventoryRepository.findOne({
      where: { business: { id: businessId } },
    });

    if (!inventory) {
      throw new Error('No se encontró el inventario asociado al negocio.');
    }

    let importedCount = 0;

    for (const productData of parsedProducts) {
      // Verifica si el producto ya existe por nombre
      const existing = await this.productsService.findByName(productData.name);
      if (existing) continue;

      // 1. Crear el producto
      const product = await this.productsService.createProduct(
        {
          name: productData.name,
          description: productData.description,
          category: productData.category,
        },
        userId,
        businessId,
      );

      // 2. Crear entrada en inventario
      await this.inventoryProductsService.createInventoryProductFromImport({
        productId: product.id,
        inventoryId: inventory.id,
        stock: productData.stock,
        price: productData.price,
      });

      importedCount++;
    }

    return {
      message: `${importedCount} productos importados al inventario correctamente.`,
    };
  }
}
