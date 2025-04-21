import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { IncomingShipmentService } from './incoming-shipment.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateIncomingShipmentDto } from './dto/create-incoming-shipment.dto';

@Controller('incoming-shipment')
export class IncomingShipmentController {
  constructor(private readonly incomingShipmentService: IncomingShipmentService) {}

  @Post(':businessId/:inventoryId')
  @UseGuards(AuthGuard)
  registerIncomingShipment(
    @Body() createIncomingShipmentDto: CreateIncomingShipmentDto,
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Param('inventoryId', ParseUUIDPipe) inventoryId: string,
  ) {
    return this.incomingShipmentService.registerIncomingShipment(createIncomingShipmentDto, businessId, inventoryId)
  }
}
