import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelImportService } from './excel-import.service';

@Controller('excel-import')
export class ExcelImportController {
  constructor(private readonly excelImportService: ExcelImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string, 
    @Body('businessId') businessId: string
  ) {
    return this.excelImportService.importProducts(file.buffer, userId, businessId);
  }
}
