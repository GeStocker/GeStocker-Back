import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CreateCollaboratorDto, LoginCollaboratorDto } from './dto/create-collaborator.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/interfaces/roles.enum';
import { RolesGuard } from '../auth/roles.guard';

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post('/signup')
  @Roles(
    UserRole.BASIC ||
    UserRole.PROFESIONAL ||
    UserRole.BUSINESS ||
    UserRole.ADMIN ||
    UserRole.SUPERADMIN
  )
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.collaboratorsService.create(createCollaboratorDto);
  }

  @Post('/login')
  @UseGuards(AuthGuard)
  login(@Body() credentials: LoginCollaboratorDto) {
    return this.collaboratorsService.loginCollaborator(credentials);
  }

  @Get('business/:businessId')
  @UseGuards(AuthGuard)
  findBusinessCollaborators(@Param('businessId') businessId: string) {
    return this.collaboratorsService.findBusinessCollaborators(businessId);
  }

  @Get(':id')
  @Roles(
    UserRole.BASIC ||
    UserRole.PROFESIONAL ||
    UserRole.BUSINESS ||
    UserRole.ADMIN ||
    UserRole.SUPERADMIN,
  )
  @UseGuards(AuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.collaboratorsService.findOne(id);
  }

  @Delete(':id')
  @Roles(
    UserRole.BASIC ||
    UserRole.PROFESIONAL ||
    UserRole.BUSINESS ||
    UserRole.ADMIN ||
    UserRole.SUPERADMIN,
  )
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.collaboratorsService.deactivateCollaborator(id);
  }
}
