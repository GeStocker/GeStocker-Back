import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        console.log('GoogleAuthGuard - handleRequest ejecutado');
        console.log('Plan recibido en la query:', request.query?.plan);

        if (request.query?.plan) {
            if (!user) user = {};
            user.selectedPlan = request.query.plan;
        }

        return super.handleRequest(err, user, info, context);
    }

    getRequest(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        console.log('GoogleAuthGuard - getRequest ejecutado');
        console.log('Plan en query:', request.query?.plan);
        console.log('Session antes:', request.session);

        if (!request.session) {
            console.warn('⚠️ No hay sesión disponible en la request.');
        } else if (request.query?.plan) {
            request.session.selectedPlan = request.query.plan;
            console.log('Session después:', request.session);
        }

        return request;
    }
}
