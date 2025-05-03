import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import db from '../config/db.js';

const router = express.Router();

// Obtener las reservas del usuario autenticado
router.get('/reservation/user', authenticate, async (req, res) => {
  const userId = req.userId;

  try {
    // Consultar las reservas del usuario
    const [reservations] = await db.query(`
      SELECT r.*, h.name AS hotel, rm.type AS room_type
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms rm ON r.room_id = rm.id
      WHERE r.user_id = ? AND r.status != 'eliminada'
      ORDER BY r.created_at DESC
    `, [userId]);

    // Verificar si hay reservas
    if (reservations.length === 0) {
      return res.status(404).json({ message: 'No se encontraron reservas para este usuario.' });
    }

    // Responder con el array de reservas
    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas del usuario:', error);
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
});

// Cancelar una reserva
router.delete('/reservation/cancel/:id', authenticate, async (req, res) => {
  const userId = req.userId;
  const reservationId = req.params.id;

  try {
    // Marcar la reserva como eliminada
    const [result] = await db.query(`
      UPDATE reservations
      SET status = 'eliminada'
      WHERE id = ? AND user_id = ?
    `, [reservationId, userId]);

    // Verificar si la reserva fue encontrada y eliminada
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada o no autorizada' });
    }

    res.status(200).json({ message: 'Reserva cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ message: 'Error al cancelar reserva' });
  }
});

export default router;
