import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ProductsService } from '../products/products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ImportInventoryProductDto } from './dto/create-import-InventoryProductDTO';
import { IncomingShipmentService } from '../incoming-shipment/incoming-shipment.service';
import { IncomingProductDto } from '../incoming-shipment/dto/create-incoming-shipment.dto';

@Injectable()
export class ExcelImportInventoryService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly incomingShipmentService: IncomingShipmentService,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}
  
  async parseExcel(fileBuffer: Buffer): Promise<(ImportInventoryProductDto & { purchasePrice: number })[]> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    return rawData.map((row: any) => ({
      name: row['Name'],
      description: row['Description'],
      category: row['Category'],
      stock: Number(row['Stock']),
      price: Number(row['SellingPrice']),
      purchasePrice: Number(row['Purchase Price']),
    }));
  }

  async importInventoryProducts(
    fileBuffer: Buffer,
    userId: string,
    businessId: string,
    inventoryId: string,
  ): Promise<{ message: string }> {
    const parsedProducts = await this.parseExcel(fileBuffer);

    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId, business: { id: businessId } },
    });

    if (!inventory) {
      throw new Error('No se encontró el inventario asociado al negocio.');
    }

    let importedCount = 0;
    const products: IncomingProductDto[] = [];

    for (const productData of parsedProducts) {
      let product = await this.productsService.findByName(productData.name);

      if (!product) {
        product = await this.productsService.createProduct(
          {
            name: productData.name,
            description: productData.description,
            category: productData.category,
          },
          userId,
          businessId,
        );
      }

      products.push({
        productId: product.id,
        quantity: productData.stock,
        purchasePrice: productData.purchasePrice,
        sellingPrice: productData.price,
      });

      importedCount++;
    }

    await this.incomingShipmentService.registerIncomingShipment(
      {
        products,
        date: new Date(),
      },
      businessId,
      inventoryId,
    );

    return {
      message: `${importedCount} productos importados con ingreso registrado correctamente.`,
    };
  }
}
