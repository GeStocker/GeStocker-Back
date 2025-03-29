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

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post('/signup')
  @UseGuards(AuthGuard)
  @Roles(
    UserRole.BASIC ||
    UserRole.PROFESIONAL ||
    UserRole.BUSINESS ||
    UserRole.ADMIN ||
    UserRole.SUPERADMIN,
  )
  create(@Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.collaboratorsService.create(createCollaboratorDto);
  }

  @Post('/login')
  @UseGuards(AuthGuard)
  login(@Body() credentials: LoginCollaboratorDto) {
    return this.collaboratorsService.loginCollaborator(credentials);
  }
  @Get()
  @UseGuards(AuthGuard)
  @Roles(UserRole.SUPERADMIN)
  findAll() {
    return this.collaboratorsService.findAll();
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(
    UserRole.BASIC ||
    UserRole.PROFESIONAL ||
    UserRole.BUSINESS ||
    UserRole.ADMIN ||
    UserRole.SUPERADMIN,
  )
  findOne(@Param('id') id: string) {
    return this.collaboratorsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(
    UserRole.BASIC ||
    UserRole.PROFESIONAL ||
    UserRole.BUSINESS ||
    UserRole.ADMIN ||
    UserRole.SUPERADMIN,
  )
  remove(@Param('id') id: string) {
    return this.collaboratorsService.deactivateCollaborator(id);
  }
}
