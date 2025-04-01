import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
};
