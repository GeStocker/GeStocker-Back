// authGoogle.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
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

        if (request.query?.plan) {
            request.session.plan = request.query.plan;
        }

        return request;
    }
}