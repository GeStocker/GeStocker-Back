import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { BussinesService } from './bussines.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Request } from 'express';
import { UserRole } from '../roles/dto/create-role.dto';

@Controller('bussines')
export class BussinesController {
  constructor(private readonly businessService: BussinesService) {}

  @Post()
  createBusiness(@Body() createBusinessDto: CreateBusinessDto,
  @Req() request: Request & { user: { id: string, email: string, role: UserRole[]} }, // FALTARIA CUSTOMIZAR UN REQUEST
) {
    const userId = request.user.id;
    return this.businessService.createBusiness(createBusinessDto, userId);
  }

  @Get()
  findAll() {
    return this.businessService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBussineDto: UpdateBusinessDto) {
    return this.businessService.update(+id, updateBussineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.businessService.remove(+id);
  }
}
