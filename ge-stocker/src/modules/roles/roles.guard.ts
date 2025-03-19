import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from './dto/create-role.dto';
import { CustomRequest } from 'src/interfaces/custom-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
            context.getHandler(),
            context.getClass()
        ]);

        const request: CustomRequest = context.switchToHttp().getRequest();
        const user = request.user;

        const hasRole = () => requiredRoles.some((role) => user?.roles?.includes(role));

        const valid = user && user.roles && hasRole();

        if (!valid) {
            throw new ForbiddenException('You do not have permission! Only admin can access this route');
        }
        return valid;
    }
}
