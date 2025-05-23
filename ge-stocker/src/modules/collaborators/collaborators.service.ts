import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCollaboratorDto, LoginCollaboratorDto } from './dto/create-collaborator.dto';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Collaborator } from './entities/collaborator.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Inventory } from '../inventory/entities/inventory.entity';
import { UserRole } from 'src/interfaces/roles.enum';
import { sendEmail } from 'src/emails/config/mailer';
import { Business } from '../bussines/entities/bussines.entity';
@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly JwtService: JwtService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) { }
  async create(collaborator: CreateCollaboratorDto) {
    const { email, username, password, inventoryId } = collaborator;

    const existingCollaborator = await this.collaboratorRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingCollaborator) throw new ConflictException('El email o username ya estan en uso');

    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });
    if (!inventory) throw new NotFoundException('Inventario no encontrado');

    const business = await this.businessRepository.findOne({
      where: { id: inventory.business?.id },
    });

    if (!inventory) throw new NotFoundException('Inventario no encontrado');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCollaborator = await this.collaboratorRepository.save({
      email,
      username,
      password: hashedPassword,
      inventory,
      business
    });

    await sendEmail(newCollaborator.email, 'Bienvenido a Ge-Stocker', 'colaborattor', {email: newCollaborator.email, password: collaborator.password});
    const { password: _, ...collaboratorWithoutPassword } = newCollaborator;
    return collaboratorWithoutPassword;
  }

  async loginCollaborator(credentials: LoginCollaboratorDto) {
    const { email, password } = credentials;
    const collaborator = await this.collaboratorRepository.findOne({
      where: { email },
      relations: ['inventory'],
    });

    if (!collaborator) {
      throw new UnauthorizedException('Usuario no encontrado');
    };

    const business = await this.businessRepository.findOne({
      where: { inventories: { id: collaborator.inventory.id }},
      relations: ['user']
    })

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    };

    if(business.user.isBanned) throw new UnauthorizedException('El dueño de este negocio ha sido baneado')

    const isPasswordValid = await bcrypt.compare(
      password,
      collaborator.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    };

    const collaboratorPayload = {
      username: collaborator.username,
      id: collaborator.id,
      inventoryId: collaborator.inventory.id,
      roles: collaborator.isAdmin
        ? [UserRole.BUSINESS_ADMIN]
        : [UserRole.COLLABORATOR],
      businessId: business.id,
    };

    const token = this.JwtService.sign(collaboratorPayload, { expiresIn: '12h' });

    return {
      success: 'Inicio de sesion exitoso, firma creada por 12 horas',
      token,
    };
  }

  async findBusinessCollaborators(businessId: string) {
    if (!businessId) {
      throw new BadRequestException("El ID del negocio es requerido.")
    }

    return await this.collaboratorRepository.find({
      where: { inventory: { business: { id: businessId } } },
      relations: ['inventory'],
    });
  }

  async promoteToAdmin(id: string) {
    const collaborator = await this.collaboratorRepository.findOne({
      where: { id },
      relations: ['inventory'],
    });

    if (!collaborator) {
      throw new NotFoundException('Colaborador no encontrado');
    }
    if (collaborator.isAdmin) {
      throw new ConflictException('El colaborador ya es administrador');
    }

    collaborator.isAdmin = true;
    collaborator.roles = [UserRole.BUSINESS_ADMIN];
    await this.collaboratorRepository.save(collaborator);

    const { password, ...result } = collaborator;
    return result;
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
