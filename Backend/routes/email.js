import express from 'express';
import { getTransporter } from '../config/config.js'; // Importar el transporter
import dotenv from 'dotenv';

dotenv.config();  // Cargar las variables de entorno

const router = express.Router();

router.post('/sendConfirmation', async (req, res) => {
  const { guest_name, guest_email, check_in_date, check_out_date, room_type, total, reservation_code, provider } = req.body;

  try {
    // Obtener el transporter para el proveedor seleccionado
    const transporter = getTransporter(provider);

    // Contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,  // El correo desde el cual se enviará
      to: guest_email,
      subject: 'Confirmación de reserva - Tu Hotel',
      html: `
        <h3>Hola ${guest_name},</h3>
        <p>Gracias por tu reserva en Tu Hotel. Aquí están los detalles:</p>
        <ul>
          <li><strong>Habitación:</strong> ${room_type}</li>
          <li><strong>Fecha de entrada:</strong> ${check_in_date}</li>
          <li><strong>Fecha de salida:</strong> ${check_out_date}</li>
          <li><strong>Total:</strong> $${total}</li>
          <li><strong>Código de reserva:</strong> ${reservation_code}</li>
        </ul>
        <p>¡Esperamos verte pronto!</p>
      `,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Correo enviado con éxito' });

  } catch (error) {
    console.error('Error enviando el correo:', error);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
});

export default router;
