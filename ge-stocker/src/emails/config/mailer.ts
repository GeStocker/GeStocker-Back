import * as fs from 'fs';
import * as fsE from 'fs-extra';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { config as dotenv } from 'dotenv';

dotenv({ path: '.env.development' });
const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

const copyTemplates = () => {
  const srcDir = path.join(process.cwd(), 'src/emails/templates');

  const destDir = path.join(process.cwd(), 'dist/emails/templates');

  if (!fsE.existsSync(destDir)) {
    fsE.copySync(srcDir, destDir);
  }
};

copyTemplates();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 *
 * @param to
 * @param subject
 * @param template
 * @param variables
 */
export const sendEmail = async (
  to: string,
  subject: string,
  template: string,
  variables: Record<string, string>,
) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      'dist/emails/templates',
      `${template}.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${template}.hbs no encontrado.`);
    }

    const templateFile = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = handlebars.compile(templateFile);
    const htmlContent = compiledTemplate(variables);

    // Enviar el correo
    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
};
