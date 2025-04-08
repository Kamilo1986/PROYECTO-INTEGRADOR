// routes/hotels.js
import express from 'express';
import db from '../config/db.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🏨 Obtener todos los hoteles
router.get('/', async (req, res) => {
  try {
    // Limitamos a 20 hoteles
    const [hotels] = await db.execute('SELECT * FROM hotels LIMIT 20');
    res.status(200).json(hotels);
  } catch (error) {
    console.error('Error al obtener hoteles:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener los hoteles' });
  }
});

// 🏨 Agregar un nuevo hotel (solo admin)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  const { name, address, rating, price_per_night, amenities, image } = req.body;

  // Validación básica
  if (!name || !address || !rating || !price_per_night || !amenities || !image) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    await db.execute(
      'INSERT INTO hotels (name, address, rating, price_per_night, amenities, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, address, rating, price_per_night, amenities, image]
    );
    res.status(201).json({ message: 'Hotel agregado correctamente' });
  } catch (error) {
    console.error('Error al agregar hotel:', error);
    res.status(500).json({ message: 'Error en el servidor al agregar el hotel' });
  }
});

// 🏨 Editar un hotel (solo admin)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const { name, address, rating, price_per_night, amenities, image } = req.body;
  const { id } = req.params;

  try {
    await db.execute(
      'UPDATE hotels SET name = ?, address = ?, rating = ?, price_per_night = ?, amenities = ?, image = ? WHERE id = ?',
      [name, address, rating, price_per_night, amenities, image, id]
    );
    res.status(200).json({ message: 'Hotel actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar hotel:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar el hotel' });
  }
});

// 🏨 Eliminar un hotel (solo admin)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM hotels WHERE id = ?', [id]);
    res.status(200).json({ message: 'Hotel eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar hotel:', error);
    res.status(500).json({ message: 'Error en el servidor al eliminar el hotel' });
  }
});

export default router;
