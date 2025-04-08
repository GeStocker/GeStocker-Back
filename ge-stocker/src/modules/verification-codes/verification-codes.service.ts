import { Injectable } from '@nestjs/common';
import { sendEmail } from 'src/emails/config/mailer';

@Injectable()
export class VerificationCodesService {
  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    await sendEmail(
      email,
      'Código de recuperación de contraseña',
      `<p>Tu código de recuperación de contraseña es: <strong>${code}</strong></p>`,
      {code: code, email: email},
    );
  }
}
