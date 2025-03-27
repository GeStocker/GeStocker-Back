import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post('/collaborator/signup')
  create(@Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.collaboratorsService.create(createCollaboratorDto);
  }

  @Post('/collaborator/login')
  login(@Body() credentials: CreateCollaboratorDto) {
    return this.collaboratorsService.loginCollaborator(credentials);
  }

  @Get()
  findAll() {
    return this.collaboratorsService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collaboratorsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collaboratorsService.deactivateCollaborator(id);
  }
}
