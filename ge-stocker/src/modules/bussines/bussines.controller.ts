import { Controller, Get, Post, Body, Param, Delete, Req, Put } from '@nestjs/common';
import { BussinesService } from './bussines.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Request } from 'express';
import { UserRole } from '../roles/dto/create-role.dto';

@Controller('bussines')
export class BussinesController {
  constructor(private readonly businessService: BussinesService) {}

  @Post()
  createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
    @Req() request: Request & { user: { id: string, email: string, role: UserRole[]} }, // FALTARIA CUSTOMIZAR UN REQUEST
) {
    const userId = request.user.id;
    return this.businessService.createBusiness(createBusinessDto, userId);
  }

  @Get()
  getUserBusinesses(@Req() request: Request & { user: { id: string, email: string, role: UserRole[]} }) {
    const userId = request.user.id
    return this.businessService.getUserBusinesses(userId);
  }

  @Get(':businessId')
  getUserBusinessById(
    @Param('businessId') businessId: string, 
    @Req() request: Request & { user: { id: string, email: string, role: UserRole[]} }
) {
    const userId = request.user.id
    return this.businessService.getUserBusinessById(businessId, userId);
  }

  @Put(':businessId')
  updateBusiness(
    @Param('id') businessId: string, 
    @Body() updateBussineDto: UpdateBusinessDto,
    @Req() request: Request & { user: { id: string, email: string, role: UserRole[]} }
  ) {
    const userId = request.user.id;
    return this.businessService.updateBusiness(businessId, updateBussineDto, userId);
  }

  @Put('deactivate/:businessId')
  deactivateBusiness(
    @Param('businessId') businessId: string,
    @Req() request: Request & { user: { id: string, email: string, role: UserRole[]} },
  ) {
    const userId = request.user.id;
    return this.businessService.deactivateBusiness(businessId, userId);
  }
}
