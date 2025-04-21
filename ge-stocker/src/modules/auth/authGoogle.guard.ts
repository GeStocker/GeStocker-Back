import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        if (request.query?.plan) {
            if (!user) user = {};
            user.selectedPlan = request.query.plan;
        }

        return super.handleRequest(err, user, info, context);
    }

    getRequest(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        if (!request.session) {
            throw new UnauthorizedException('No session found');
        } else if (request.query?.plan) {
            request.session.selectedPlan = request.query.plan;
        }

        return request;
    }
}
