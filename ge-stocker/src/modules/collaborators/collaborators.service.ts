import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCollaboratorDto } from './dto/create-collaborator.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Collaborator } from './entities/collaborator.entity';
import { Repository } from 'typeorm';
@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
  ) {}
  async create(collaborator: CreateCollaboratorDto) {
    const { username, password } = collaborator;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCollaborator = await this.collaboratorRepository.save({
      username,
      password: hashedPassword,
    });

    const { password: _, ...collaboratorWithoutPassword } = newCollaborator;
    return collaboratorWithoutPassword;
  }

  async loginCollaborator(credentials: CreateCollaboratorDto) {
    const { username, password } = credentials;
    const collaborator = await this.collaboratorRepository.findOne({
      where: { username },
    });
    if (!collaborator) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      collaborator.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }
    const collaboratorPayload = {
      username: collaborator.username,
      sub: collaborator.id,
    };

    return collaboratorPayload;
  }

  async findAll() {
    return await this.collaboratorRepository.find();
  }

  async findOne(id: string) {
    const collaboratorFound = await this.collaboratorRepository.findOne({
      where: { id },
    });
    if (!collaboratorFound) {
      throw new UnauthorizedException('Colaborador no encontrado');
    }
    const { password, ...collaboratorWithoutPass } = collaboratorFound;
    return collaboratorWithoutPass;
  }

  async deactivateCollaborator(id: string) {
    const collaboratorFound = await this.collaboratorRepository.findOne({
      where: { id },
    });
    if (!collaboratorFound) {
      throw new UnauthorizedException('Colaborador no encontrado');
    }
    collaboratorFound.isActive = false;
    await this.collaboratorRepository.save(collaboratorFound);
    return 'Colaborador eliminado con éxito';
  }
}
