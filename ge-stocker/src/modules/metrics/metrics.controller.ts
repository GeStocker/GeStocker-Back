import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
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

  @Get('low-stock/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BASIC, UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  getLowStockMetrics(@Param('businessId') businessId: string) {
    return this.metricsService.getLowStockMetrics(businessId);
  }

  @Get('obsolete-product/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BASIC, UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  getProductsWithoutSales(
    @Param('businessId') businessId: string, 
    @Query('days', new DefaultValuePipe(90), ParseIntPipe) days: number,
  ) {
    return this.metricsService.getProductsWithoutSales(businessId, days);
  }

  @Get('profit-margin/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  getProfitMargin(
    @Param('businessId') businessId: string,
    @Query('category') categoryId?: string,
    @Query('expand') expand?: boolean,
  ) {
    return this.metricsService.getProfitMargin(businessId, categoryId, expand)
  }

  @Get('avg-sales/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  getAverageSalesByProduct(
    @Param('businessId') businessId: string,
    @Query('category') categoryId?: string,
    @Query('expand') expand?: boolean,
    @Query('sortBy') sortBy: 'daily' | 'monthly' = 'daily',
  ) {
    return this.metricsService.getAverageSalesByProduct(businessId, sortBy, categoryId, expand)
  }
}
