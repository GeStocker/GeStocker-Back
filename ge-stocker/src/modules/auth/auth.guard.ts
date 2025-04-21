import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { CustomRequest } from 'src/interfaces/custom-request.interface';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Collaborator } from '../collaborators/entities/collaborator.entity';
import { Business } from '../bussines/entities/bussines.entity';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Collaborator)
        private readonly collaboratorRepository: Repository<Collaborator>,
        @InjectRepository(User)
        private readonly businessRepository: Repository<Business>,
        private readonly jwtService: JwtService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request: CustomRequest = context.switchToHttp().getRequest();
        const token = request.headers['authorization']?.split(' ')[1] ?? '';
        if (!token) {
            throw new UnauthorizedException('No se ha enviado el token de autenticación');
        }
        try {
            const secret = process.env.JWT_SECRET;
            const payload = this.jwtService.verify(token, { secret });

            if(payload.roles?.some((role: string) => ['basic', 'professional', 'business', 'admin', 'superadmin'].includes(role))) {
                const user = await this.userRepository.findOne({
                    where: { id: payload.id }
                });

                if(!user || user.isBanned) throw new UnauthorizedException('Usuario baneado');
            };

            // if(payload.roles?.includes('COLLABORATOR') || payload.roles?.includes('BUSINESS_ADMIN')) {
            //     const collaborator = await this.collaboratorRepository.findOne({
            //         where: { id: payload.id },
            //         relations: ['inventory'],
            //     });

            //     if(!collaborator) throw new UnauthorizedException('Colaborador no encontrado');

            //     const business = await this.businessRepository.findOne({
            //         where: { inventories: { id: collaborator.inventory.id } },
            //         relations: ['user'],
            //     });

            //     if(!business || business.user.isBanned) throw new UnauthorizedException('Usuario baneado');
            // }
            
            payload.iat = new Date(payload.iat * 1000);
            payload.exp = new Date(payload.exp * 1000);
            request.user = payload;
            return Promise.resolve(true);
        } catch (error) {
            throw new UnauthorizedException('Token inválido');

        }
    }
}
