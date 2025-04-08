import { Controller, Get, Post, Body, Param, Delete, Req, Put, UseGuards } from '@nestjs/common';
import { BussinesService } from './bussines.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CustomRequest } from 'src/interfaces/custom-request.interface';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/interfaces/roles.enum';

@Controller('bussines')
export class BussinesController {
  constructor(private readonly businessService: BussinesService) { }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BASIC, UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
    @Req() request: CustomRequest,
  ) {
    const userId = request.user.id;
    return this.businessService.createBusiness(createBusinessDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BASIC, UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN, UserRole.BUSINESS_ADMIN)
  getUserBusinesses(@Req() request: CustomRequest) {
    const userId = request.user.id
    return this.businessService.getUserBusinesses(userId);
  }

  @Get(':businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BASIC, UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN, UserRole.BUSINESS_ADMIN)
  getUserBusinessById(
    @Param('businessId') businessId: string,
    @Req() request: CustomRequest
  ) {
    const userId = request.user.id
    return this.businessService.getUserBusinessById(businessId, userId);
  }

  @Put(':businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BASIC, UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN, UserRole.BUSINESS_ADMIN, UserRole.COLLABORATOR)
  updateBusiness(
    @Param('id') businessId: string,
    @Body() updateBussineDto: UpdateBusinessDto,
    @Req() request: CustomRequest
  ) {
    const userId = request.user.id;
    return this.businessService.updateBusiness(businessId, updateBussineDto, userId);
  }

  @Put('deactivate/:businessId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BASIC, UserRole.PROFESIONAL, UserRole.BUSINESS, UserRole.SUPERADMIN)
  deactivateBusiness(
    @Param('businessId') businessId: string,
    @Req() request: CustomRequest,
  ) {
    const userId = request.user.id;
    return this.businessService.deactivateBusiness(businessId, userId);
  }
}
