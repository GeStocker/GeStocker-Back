import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';
import { UserRole } from 'src/interfaces/roles.enum';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  getAllUsersList(
    @Query('isActive') isActive: boolean = true,
    @Query('plan') plan?: string,
  ) {
    return this.superAdminService.getAllUsersList(isActive, plan);
  }

  @Get('users/businesses/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  getUserBusinesses(@Param('userId') userId: string) {
    return this.superAdminService.getUserBusinesses(userId);
  }

  @Get('business/products/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  getBusinessProducts(@Param('businessId') businessId: string) {
    return this.superAdminService.getBusinessProducts(businessId);
  }

  @Get('subscription-metrics')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  getSubscriptionMetrics(@Query('page') page: number = 0) {
    return this.superAdminService.getSubscriptionMetrics(page);
  }

  @Patch('users/ban/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  banUser(
    @Param('userId') userId: string, 
    @Body() reason: string) {
    return this.superAdminService.banUser(userId, reason);
  }

  @Patch('users/unban/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  unbanUser(@Param('userId') userId: string) {
    return this.superAdminService.unbanUser(userId);
  }

  @Patch('users/sub/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  changeUserSubscription(@Param('userId') userId: string, @Body() newPlan: UserRole) {
    return this.superAdminService.changeUserSubscription(userId, newPlan)
  }
}
