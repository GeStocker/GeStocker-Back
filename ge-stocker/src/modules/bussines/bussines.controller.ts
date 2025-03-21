import { Controller, Get, Post, Body, Param, Delete, Req, Put, UseGuards } from '@nestjs/common';
import { BussinesService } from './bussines.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CustomRequest } from 'src/interfaces/custom-request.interface';
import { AuthGuard } from '../auth/auth.guard';

@Controller('bussines')
export class BussinesController {
  constructor(private readonly businessService: BussinesService) { }

  @Post()
  @UseGuards(AuthGuard)
  createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
    @Req() request: CustomRequest,
  ) {
    const userId = request.user.id;
    return this.businessService.createBusiness(createBusinessDto, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  getUserBusinesses(@Req() request: CustomRequest) {
    const userId = request.user.id
    return this.businessService.getUserBusinesses(userId);
  }

  @Get(':businessId')
  @UseGuards(AuthGuard)
  getUserBusinessById(
    @Param('businessId') businessId: string,
    @Req() request: CustomRequest
  ) {
    const userId = request.user.id
    return this.businessService.getUserBusinessById(businessId, userId);
  }

  @Put(':businessId')
  @UseGuards(AuthGuard)
  updateBusiness(
    @Param('id') businessId: string,
    @Body() updateBussineDto: UpdateBusinessDto,
    @Req() request: CustomRequest
  ) {
    const userId = request.user.id;
    return this.businessService.updateBusiness(businessId, updateBussineDto, userId);
  }

  @Put('deactivate/:businessId')
  @UseGuards(AuthGuard)
  deactivateBusiness(
    @Param('businessId') businessId: string,
    @Req() request: CustomRequest,
  ) {
    const userId = request.user.id;
    return this.businessService.deactivateBusiness(businessId, userId);
  }
}
