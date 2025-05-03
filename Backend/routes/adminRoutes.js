import express from 'express';
// ✅ Correcto
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

import db from '../config/db.js';

const router = express.Router();

// Obtener todas las reservas (solo para administradores)
router.get('/reservas', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [reservas] = await db.execute(`
      SELECT r.id, r.reservation_code, r.user_id, u.name AS usuario, r.hotel_id, h.name AS hotel,
    r.room_type, r.check_in AS check_in_date, r.check_out AS check_out_date, r.nights,
      r.total_price, r.guest_name, r.guest_phone, r.status
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN hotels h ON r.hotel_id = h.id
      ORDER BY r.check_in DESC
    `);

    res.status(200).json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
});

export default router;
