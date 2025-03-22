import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto, LoginAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../../interfaces/roles.enum';
import { JwtService } from '@nestjs/jwt';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly JwtService: JwtService,
  ) {}

  async registerUser(user: CreateAuthDto): Promise<Partial<User>> {
    const {
      email,
      password,
      passwordConfirmation,
      roles,
      ...userWithoutConfirmation
    } = user;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Correo ya registrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = roles[0];

    if (!role) throw new BadRequestException('No role selected');
    const newUser = await this.userRepository.save({
      ...userWithoutConfirmation,
      email,
      password: hashedPassword,
      roles: [role],
      img: '', // Ensure img is a string
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(
    credentials: LoginAuthDto,
  ): Promise<{ success: string; token: string }> {
    const { email, password } = credentials;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      roles: [
        UserRole.BASIC ||
          UserRole.PROFESIONAL ||
          UserRole.BUSINESS ||
          UserRole.ADMIN ||
          UserRole.SUPERADMIN,
      ],
      
    };


    const token = this.JwtService.sign(userPayload, { expiresIn: '1h' });

    return {
      success: 'Inicio de sesion exitoso, firma creada por 1 hora',
      token,
    };
  }
  async registerOrUpdateGoogleUser(profile: any): Promise<Partial<User>> {
    const { email, firstName, lastName } = profile;
  
    let user = await this.userRepository.findOne({
      where: { email },
    });
  
    if (user) {
      throw new NotFoundException('Usuario ya registrado');
    }

    user = await this.userRepository.save({
      name: `${firstName} ${lastName}`,
      email
    });
  
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async loginWithGoogle(profile: any): Promise<{ success: string; token: string }> {
    const { email } = profile;
    let user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('Usuario no registrado');
    }
    const userPayload = {
      id: user.id,
      email: user.email,
      roles: [
        UserRole.BASIC ||
          UserRole.PROFESIONAL ||
          UserRole.BUSINESS ||
          UserRole.ADMIN ||
          UserRole.SUPERADMIN,
      ],
      
    };


    const token = this.JwtService.sign(userPayload, { expiresIn: '1h' });

    return {
      success: 'Inicio de sesion exitoso, firma creada por 1 hora',
      token,
    };
  }
}
