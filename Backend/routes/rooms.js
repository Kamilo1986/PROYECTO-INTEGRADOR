import express from 'express';
import db from '../config/db.js';

const router = express.Router();

/**
 * @route   GET /api/rooms
 * @desc    Obtener todas las habitaciones disponibles
 */
router.get('/', async (req, res) => {
  try {
    // Modificar la consulta para incluir hotel_id
    const query = 'SELECT id, room_type, price, image, description, hotel_id FROM rooms WHERE available = 1';
    const [rooms] = await db.query(query);

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


/**
 * @route   GET /api/rooms/:hotelId/available
 * @desc    Obtener habitaciones disponibles de un hotel específico
 */
router.get('/:hotelId/available', async (req, res) => {
  const { hotelId } = req.params;

  if (!hotelId || isNaN(hotelId)) {
    return res.status(400).json({ message: 'ID de hotel inválido' });
  }

  try {
    // ✅ Agregar LIMIT 4 para devolver solo 4 habitaciones por hotel
    const query = 'SELECT id, room_type, price, image, description FROM rooms WHERE hotel_id = ? AND available = 1 LIMIT 4';
    const [rooms] = await db.query(query, [hotelId]);

    if (rooms.length > 0) {
      res.json({ rooms });
    } else {
      res.status(404).json({ message: 'No hay habitaciones disponibles para este hotel' });
    }
  } catch (error) {
    console.error("Error al obtener habitaciones por hotel:", error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
});

/**
 * @route   GET /api/rooms/room/:roomId
 * @desc    Obtener una habitación específica por su ID
 */
router.get('/room/:roomId', async (req, res) => {
  const { roomId } = req.params;

  // Validar que roomId sea un número válido
  if (!roomId || isNaN(roomId)) {
    return res.status(400).json({ message: 'ID de habitación inválido' });
  }

  try {
    // Reemplazamos la consulta para obtener el precio, imagen y descripción
    const query = 'SELECT id, room_type, price, image, description FROM rooms WHERE id = ?';
    const [room] = await db.query(query, [roomId]);

    // Si la habitación no se encuentra, devolver un error 404
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
