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
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/interfaces/roles.enum';

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post('/signup')
  @Roles(
    UserRole.BASIC ||
      UserRole.PROFESIONAL ||
      UserRole.BUSINESS ||
      UserRole.ADMIN ||
      UserRole.SUPERADMIN,
  )
  @UseGuards(AuthGuard)
  create(@Body() createCollaboratorDto: CreateCollaboratorDto) {
    return this.collaboratorsService.create(createCollaboratorDto);
  }

  @Post('/login')
  @Roles(
    UserRole.BASIC ||
      UserRole.PROFESIONAL ||
      UserRole.BUSINESS ||
      UserRole.ADMIN ||
      UserRole.SUPERADMIN,
  )
  @UseGuards(AuthGuard)
  login(@Body() credentials: CreateCollaboratorDto) {
    return this.collaboratorsService.loginCollaborator(credentials);
  }
  @Get()
  @Roles(UserRole.SUPERADMIN)
  @UseGuards(AuthGuard)
  findAll() {
    return this.collaboratorsService.findAll();
  }
  @Get(':id')
  @Roles(
    UserRole.BASIC ||
      UserRole.PROFESIONAL ||
      UserRole.BUSINESS ||
      UserRole.ADMIN ||
      UserRole.SUPERADMIN,
  )
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.collaboratorsService.deactivateCollaborator(id);
  }
}
