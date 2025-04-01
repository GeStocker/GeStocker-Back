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

    const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!rawData || rawData.length === 0) {
        throw new Error('El archivo está vacío o no contiene datos válidos.');
    }

    const requiredFields = ['Name', 'Description', 'Category'];
    
    if (typeof rawData[0] !== 'object' || rawData[0] === null) {
        throw new Error('Los datos del archivo no tienen un formato válido.');
    }

    const headers = Object.keys(rawData[0] as object);

    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
        throw new Error(`Faltan las siguientes columnas en el archivo: ${missingFields.join(', ')}`);
    }

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
        continue;
      }
      importedCount++;
      await this.productsService.createProduct(productData, userId, businessId);
    }

    return { message: `${importedCount} productos importados correctamente` };
  }
}
