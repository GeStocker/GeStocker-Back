import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ExcelExportInventoryService } from './export-excel-inventory.service';

@Controller('inventory/export')
export class ExportInventoryController {
  constructor(
    private readonly excelExportInventoryService: ExcelExportInventoryService,
  ) {}

  @Get(':inventoryId')
  async exportInventoryToExcel(
    @Param('inventoryId') inventoryId: string,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.excelExportInventoryService.exportInventoryToExcel(inventoryId);

      res.setHeader('Content-Disposition', `attachment; filename=inventory-${inventoryId}.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      throw new NotFoundException(error.message || 'Error al exportar el inventario.');
    }
  }
}
