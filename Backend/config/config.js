import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // Cargar las variables de entorno

// Función para obtener el transporter para un proveedor determinado
export const getTransporter = (provider) => {
  switch (provider) {
    case 'gmail':
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    case 'outlook':
      return nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: process.env.OUTLOOK_EMAIL,
          pass: process.env.OUTLOOK_PASS,
        },
      });
    case 'yahoo':
      return nodemailer.createTransport({
        service: 'yahoo',
        auth: {
          user: process.env.YAHOO_EMAIL,
          pass: process.env.YAHOO_PASS,
        },
      });
    default:
      throw new Error('Proveedor de correo no soportado');
  }
};
