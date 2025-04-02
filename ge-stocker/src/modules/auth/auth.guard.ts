import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        
        if (!token) {
            throw new UnauthorizedException('Token de autenticación no proporcionado');
        }

        try {
            const payload = await this.verifyToken(token);
            const user = await this.validateUser(payload);
            this.checkSubscriptionStatus(user);
            
            request.user = user;
            return true;
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    private extractToken(request: Request): string | null {
        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        return type === 'Bearer' ? token : null;
    }

    private async verifyToken(token: string): Promise<any> {
        return this.jwtService.verifyAsync(token, {
            secret: this.configService.get('JWT_SECRET')
        });
    }

    private async validateUser(payload: any): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: payload.id },
            select: ['id', 'email', 'roles', 'isActive']
        });

        if (!user) {
            throw new ForbiddenException('Usuario no encontrado');
        }
        
        return user;
    }

    private checkSubscriptionStatus(user: User): void {
        if (!user.isActive) {
            throw new ForbiddenException({
                message: 'Suscripción requerida',
                redirectUrl: '/subscription/plans'
            });
        }
    }

    private handleAuthError(error: Error): never {
        if (error instanceof ForbiddenException) {
            throw error;
        }
        throw new UnauthorizedException('Token inválido o expirado');
    }
}