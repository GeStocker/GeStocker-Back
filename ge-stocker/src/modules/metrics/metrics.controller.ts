import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/interfaces/roles.enum';
import { CustomRequest } from 'src/interfaces/custom-request.interface';
import { AuthGuard } from '../auth/auth.guard';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('profit/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BASIC, UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  getMonthlyProfit(
    @Param('businessId') businessId: string, 
    @Req() request: CustomRequest,
    @Query('year') year?: string,
  ) {
    const userId = request.user.id;
    const selectedYear = year ? parseInt(year, 10) : new Date().getFullYear();

    return this.metricsService.getMonthlyProfit(businessId, userId, selectedYear);
  }
}
