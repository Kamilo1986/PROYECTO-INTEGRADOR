import express from 'express';
import db from '../config/db.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generación de código de reserva
const generateReservationCode = () => {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = Math.floor(1000 + Math.random() * 9000);
  const letrasAleatorias = letras.charAt(Math.floor(Math.random() * letras.length)) +
    letras.charAt(Math.floor(Math.random() * letras.length)) +
    letras.charAt(Math.floor(Math.random() * letras.length));
  return letrasAleatorias + numeros;
};

// Formatear fecha
const formatDate = (isoDate) => {
  return new Date(isoDate).toISOString().split('T')[0];
};

// Crear una reserva
const createReservation = async (req, res) => {
  const {
    check_in_date,
    check_out_date,
    guest_name,
    guest_phone,
    room_id,
    hotel_id
  } = req.body;

  const user_id = req.userId;

  if (
    !check_in_date ||
    !check_out_date ||
    !guest_name ||
    !guest_phone ||
    !room_id ||
    !user_id ||
    !hotel_id
  ) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  if (new Date(check_in_date) >= new Date(check_out_date)) {
    return res.status(400).json({ message: "La fecha de check-out debe ser posterior a la de check-in" });
  }

  try {
    const [room] = await db.execute('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (room.length === 0) return res.status(404).json({ message: "Habitación no encontrada" });

    const [hotel] = await db.execute('SELECT * FROM hotels WHERE id = ?', [hotel_id]);
    if (hotel.length === 0) return res.status(404).json({ message: "Hotel no encontrado" });

    const formattedCheckIn = formatDate(check_in_date);
    const formattedCheckOut = formatDate(check_out_date);
    const reservation_code = generateReservationCode();

    const [result] = await db.execute(
      'INSERT INTO reservations (check_in_date, check_out_date, guest_name, guest_phone, room_id, user_id, hotel_id, reservation_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [formattedCheckIn, formattedCheckOut, guest_name, guest_phone, room_id, user_id, hotel_id, reservation_code, 'activa']
    );

    const [reservation] = await db.execute('SELECT * FROM reservations WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: "Reserva creada correctamente",
      reservation: reservation[0]
    });
  } catch (error) {
    console.error('❌ Error al crear la reserva:', error.message);
    res.status(500).json({ message: "Error al crear la reserva en el servidor" });
  }
};

// Obtener todas las reservas (admin)
router.get('/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [reservations] = await db.execute(`
      SELECT 
        r.*, u.email AS usuario, h.name AS hotel, rm.room_type
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms rm ON r.room_id = rm.id
      ORDER BY r.check_in_date DESC
    `);

    res.status(200).json({ reservations });
  } catch (error) {
    console.error('Error al obtener reservas:', error.message);
    res.status(500).json({ message: "Error al obtener las reservas" });
  }
});

// Obtener reservas del usuario
router.get('/user', authenticate, async (req, res) => {
  const user_id = req.userId;
  try {
    const [reservations] = await db.execute(`
      SELECT 
        r.*, u.email AS usuario, h.name AS hotel, rm.room_type
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms rm ON r.room_id = rm.id
      WHERE r.user_id = ?
      ORDER BY r.check_in_date DESC
    `, [user_id]);

    res.status(200).json({ reservations });
  } catch (error) {
    console.error('Error al obtener reservas:', error.message);
    res.status(500).json({ message: "Error al obtener las reservas" });
  }
});

// Cancelar reserva (actualiza status)
router.delete('/cancel/:reservationId', authenticate, async (req, res) => {
  const { reservationId } = req.params;
  const user_id = req.userId;

  try {
    const [reservation] = await db.execute('SELECT * FROM reservations WHERE id = ? AND user_id = ?', [reservationId, user_id]);
    if (reservation.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada o no perteneces a esta reserva" });
    }

    const checkInDate = reservation[0].check_in_date;
    const now = new Date();
    if (new Date(checkInDate) <= now) {
      return res.status(400).json({ message: "No puedes cancelar esta reserva porque ya pasó el tiempo de cancelación" });
    }

    await db.execute('UPDATE reservations SET status = ? WHERE id = ?', ['cancelada', reservationId]);

    res.status(200).json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    console.error('Error al cancelar la reserva:', error.message);
    res.status(500).json({ message: "Error al cancelar la reserva" });
  }
});

// Reconfirmar reserva
router.put('/reconfirm/:reservationId', authenticate, async (req, res) => {
  const { reservationId } = req.params;
  const user_id = req.userId;

  try {
    const [reservation] = await db.execute('SELECT * FROM reservations WHERE id = ? AND user_id = ?', [reservationId, user_id]);
    if (reservation.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada o no perteneces a esta reserva" });
    }

    if (reservation[0].status !== 'cancelada') {
      return res.status(400).json({ message: "Solo puedes reconfirmar reservas que estén canceladas" });
    }

    await db.execute('UPDATE reservations SET status = ? WHERE id = ?', ['activa', reservationId]);

    res.status(200).json({ message: "Reserva reconfirmada correctamente" });
  } catch (error) {
    console.error('Error al reconfirmar reserva:', error.message);
    res.status(500).json({ message: "Error al reconfirmar la reserva" });
  }
});

// Crear reserva
router.post('/', authenticate, createReservation);

export default router;
