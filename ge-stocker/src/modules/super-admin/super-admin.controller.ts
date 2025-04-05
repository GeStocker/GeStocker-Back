import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { UserRole } from 'src/interfaces/roles.enum';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('users')
  getAllUsersList(
    @Query('isActive') isActive: boolean = true,
    @Query('plan') plan?: string,
  ) {
    return this.superAdminService.getAllUsersList(isActive, plan);
  }

  @Get('users/businesses/:userId')
  getUserBusinesses(@Param('userId') userId: string) {
    return this.superAdminService.getUserBusinesses(userId);
  }

  @Get('business/products/:businessId')
  getBusinessProducts(@Param('businessId') businessId: string) {
    return this.superAdminService.getBusinessProducts(businessId);
  }

  @Get('subscription-metrics')
  getSubscriptionMetrics(@Query('page') page: number = 0) {
    return this.superAdminService.getSubscriptionMetrics(page);
  }

  @Patch('users/ban/:userId')
  banUser(
    @Param('userId') userId: string, 
    @Body() reason: string) {
    return this.superAdminService.banUser(userId, reason);
  }

  @Patch('users/ban/:userId')
  unbanUser(@Param('userId') userId: string) {
    return this.superAdminService.unbanUser(userId);
  }

  @Patch('users/sub/:userId')
  changeUserSubscription(@Param('userId') userId: string, @Body() newPlan: UserRole) {
    return this.superAdminService.changeUserSubscription(userId, newPlan)
  }
}
