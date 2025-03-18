import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { BusinessService } from './bussines.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Controller('bussines')
export class BussinesController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  createBusiness(@Body() createBusinessDto: CreateBusinessDto,
  @Req() request,
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
