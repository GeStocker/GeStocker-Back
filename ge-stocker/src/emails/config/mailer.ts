import * as fs from "fs";
import * as fsE from "fs-extra"
import * as path from "path"
import * as nodemailer from 'nodemailer';
import handlebars from "handlebars";
import { config as dotenv } from 'dotenv';

dotenv({ path: '.env.development' });
const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

const copyTemplates = () => {
  const srcDir = path.join(process.cwd(), "src/emails/templates");
  const destDir = path.join(process.cwd(), "dist/emails/templates");

  if (!fsE.existsSync(destDir)) {
    fsE.copySync(srcDir, destDir);
    console.log("Templates copiados a dist/emails/templates/");
  }
};

// Llamamos a la función al iniciar el sistema de correos
copyTemplates();


const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Función para enviar correos con Handlebars
 * @param to Email del destinatario
 * @param subject Asunto del correo
 * @param template Nombre del archivo .hbs en la carpeta `emails/templates`
 * @param variables Objeto con variables dinámicas a reemplazar en el template
 */
export const sendEmail = async (
  to: string,
  subject: string,
  template: string,
  variables: Record<string, string> // ⬅️ Se agregan variables dinámicas
) => {
  try {
    // Ruta del template
    const templatePath = path.join(__dirname, "../templates", `${template}.hbs`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${template}.hbs no encontrado.`);
    }

    // Leer y compilar el template de Handlebars
    const templateFile = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(templateFile);
    const htmlContent = compiledTemplate(variables); // ⬅️ Renderizar el template con las variables

    // Enviar el correo
    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      html: htmlContent, // ⬅️ Ahora sí enviamos el HTML generado
    });

    console.log(`Correo enviado a ${to}`);
  } catch (error) {
    console.error("Error enviando el correo:", error);
    throw new Error(`Failed to send email: ${error}`);
  }
};
