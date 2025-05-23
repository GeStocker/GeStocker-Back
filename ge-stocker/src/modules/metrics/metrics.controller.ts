import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, ParseUUIDPipe, Query, Req, UseGuards } from '@nestjs/common';
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
    @Param('businessId', ParseUUIDPipe) businessId: string, 
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
    @Param('businessId', ParseUUIDPipe) businessId: string, 
    @Query('days', new DefaultValuePipe(90), ParseIntPipe) days: number,
  ) {
    return this.metricsService.getProductsWithoutSales(businessId, days);
  }

  @Get('profit-margin/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  getProfitMargin(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('category') categoryId?: string,
    @Query('expand') expand?: boolean,
  ) {
    return this.metricsService.getProfitMargin(businessId, categoryId, expand)
  }

  @Get('avg-sales/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  getAverageSalesByProduct(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('sortBy') sortBy: 'daily' | 'monthly' = 'daily',
    @Query('category') categoryId?: string,
    @Query('expand') expand?: boolean,
  ) {
    return this.metricsService.getAverageSalesByProduct(businessId, sortBy, categoryId, expand)
  }

  @Get('efficiency/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  getInventoryEficiency(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('days') days: 30 | 60 | 90 = 30,
    @Query('category') categoryId?: string,
    @Query('expand') expand?: boolean,
  ) {
    return this.metricsService.getInventoryEficiency(businessId, days, categoryId, expand)
  }

  @Get('lost-cost/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS, UserRole.SUPERADMIN)
  getLostProductsCost(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('category') categoryId?: string,
    @Query('expand') expand?: boolean,
  ) {
    return this.metricsService.getLostProductsCost(businessId, categoryId, expand)
  }

  @Get('rotation/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS, UserRole.SUPERADMIN)
  getInventoryRotationRate(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('days') days: 30 | 60 | 90 = 30,
    @Query('category') categoryId?: string,
    @Query('expand') expand?: boolean,
  ) {
    return this.metricsService.getInventoryRotationRate(businessId, days, categoryId, expand)
  }

  @Get('comparison/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS, UserRole.SUPERADMIN)
  getCompareInventoryPerformance(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('range') range: 30 | 60 | 90 | 270 | 365 = 30,
    @Query('sortBy') sortBy: 'salesCount' | 'lostCost' | 'turnoverRate' | 'efficiency' = 'salesCount',
  ) {
    return this.metricsService.getCompareInventoryPerformance(businessId, range, sortBy)
  }


}
