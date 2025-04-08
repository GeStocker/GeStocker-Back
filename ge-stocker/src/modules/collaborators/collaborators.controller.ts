import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CreateCollaboratorDto, LoginCollaboratorDto } from './dto/create-collaborator.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/interfaces/roles.enum';
import { RolesGuard } from '../auth/roles.guard';

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) { }

  @Post('/signup')
  @Roles(
    UserRole.BASIC,
    UserRole.PROFESIONAL,
    UserRole.BUSINESS,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
  )
  @UseGuards(AuthGuard, RolesGuard)
  create(@Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.collaboratorsService.create(createCollaboratorDto);
  }

  @Post('/login')
  login(@Body() credentials: LoginCollaboratorDto,
@Body('businessId') businessId: string) {
    return this.collaboratorsService.loginCollaborator(credentials);
  }

  @Patch(':id/promote-to-admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS, UserRole.ADMIN, UserRole.SUPERADMIN)
  async promoteToAdmin(@Param('id') id: string) {
    return this.collaboratorsService.promoteToAdmin(id);
  }

  @Get('business/:businessId')
  @UseGuards(AuthGuard)
  findBusinessCollaborators(@Param('businessId') businessId: string) {
    return this.collaboratorsService.findBusinessCollaborators(businessId);
  }

  @Get(':id')
  @Roles(
    UserRole.BASIC,
    UserRole.PROFESIONAL,
    UserRole.BUSINESS,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
  )
  @UseGuards(AuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.collaboratorsService.findOne(id);
  }

  @Delete(':id')
  @Roles(
    UserRole.BASIC,
    UserRole.PROFESIONAL,
    UserRole.BUSINESS,
    UserRole.ADMIN,
    UserRole.SUPERADMIN,
  )
  @UseGuards(AuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.collaboratorsService.deactivateCollaborator(id);
  }
}
