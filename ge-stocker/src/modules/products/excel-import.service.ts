import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ImportProductDto } from './dto/import-products.dto';
import { ProductsService } from './products.service';

@Injectable()
export class ExcelImportService {
  constructor(private readonly productsService: ProductsService) {}

  async parseExcel(fileBuffer: Buffer): Promise<ImportProductDto[]> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData = XLSX.utils.sheet_to_json(sheet);

    return rawData.map((row: any) => ({
      name: row['Name'],
      description: row['Description'],
      category: row['Category'],
    }));
  }

  async importProducts(fileBuffer: Buffer, userId: string, businessId: string) {
    const products = await this.parseExcel(fileBuffer);
    let importedCount = 0;
    for (const productData of products) {
      const productExistance = await this.productsService.findByName(
        productData.name,
      );
        if (productExistance) {
          console.log(
          `El producto ${productData.name} ya existe. Se omitirá la importación.`,
        );
        continue;
      }
      importedCount++;
      await this.productsService.createProduct(productData, userId, businessId);
    }

    return { message: `${importedCount} productos importados correctamente` };
  }
}
