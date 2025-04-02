import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService) {
        super({
            clientID: configService.get('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
            passReqToCallback: true, // Necesario para obtener el plan
            authorizationParams: {
                access_type: 'offline',
                prompt: 'select_account',
            }
        });
    }

    async validate(
        req: any,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
    ): Promise<any> {
        // Obtener el plan de los query params
        const selectedPlan = req.query.plan || 'basic';
        
        // Validar el plan recibido
        const validPlans = ['basic', 'professional', 'business'];
        if (!validPlans.includes(selectedPlan)) {
            return done(new Error('Plan seleccionado inválido'), null);
        }

        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
            selectedPlan // Incluir el plan en el objeto de usuario
        };

        done(null, user);
    }
}