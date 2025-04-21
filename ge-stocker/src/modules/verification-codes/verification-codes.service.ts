import { Injectable } from '@nestjs/common';
import { sendEmail } from 'src/emails/config/mailer';

@Injectable()
export class VerificationCodesService {
  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    await sendEmail(
      email,
      'Código de recuperación de contraseña',
      "resetPassword",
      {code: code, email: email},
    );
  }
}
