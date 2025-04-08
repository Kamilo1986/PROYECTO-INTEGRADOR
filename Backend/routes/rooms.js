import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// Ruta para obtener habitaciones disponibles de un hotel específico
router.get('/:hotelId/available', async (req, res) => {
  const { hotelId } = req.params;

  try {
    // Consulta para obtener habitaciones disponibles de un hotel
    const query = 'SELECT * FROM rooms WHERE hotel_id = ? AND available = 1';
    const [rooms] = await db.query(query, [hotelId]);

    if (rooms.length > 0) {
      res.json({ rooms });
    } else {
      res.status(404).json({ message: 'No hay habitaciones disponibles' });
    }
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

// Ruta para obtener una habitación específica por su ID
router.get('/room/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    // Consulta para obtener la habitación por su ID
    const query = 'SELECT * FROM rooms WHERE id = ?';
    const [room] = await db.query(query, [roomId]);

    // Verificamos que la habitación exista
    if (room && room.length > 0) {
      res.json({ room: room[0] });
    } else {
      res.status(404).json({ message: 'Habitación no encontrada' });
    }
  } catch (error) {
    console.error("Error al obtener la habitación:", error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

export default router;
