import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ExcelImportInventoryService } from './import-excel-inventoryProducts.service';
  
  @Controller('excel-inventory-import')
  export class ExcelInventoryImportController {
    constructor(
      private readonly excelImportInventoryService: ExcelImportInventoryService,
    ) {}
  
    @Post()
    @UseInterceptors(FileInterceptor('file')) // el campo debe llamarse 'file'
    async uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Body('userId') userId: string,
      @Body('businessId') businessId: string,
    ) {
      return this.excelImportInventoryService.importInventoryProducts(
        file.buffer,
        userId,
        businessId,
      );
    }
  }
  