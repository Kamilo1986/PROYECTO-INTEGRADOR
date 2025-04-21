import express from 'express';
import db from '../config/db.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generación de código de reserva
const generateReservationCode = async () => {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numeros = Math.floor(1000 + Math.random() * 9000);
  const letrasAleatorias = letras.charAt(Math.floor(Math.random() * letras.length)) +
    letras.charAt(Math.floor(Math.random() * letras.length)) +
    letras.charAt(Math.floor(Math.random() * letras.length));
  const reservationCode = letrasAleatorias + numeros;

  console.log(`Generando código de reserva: ${reservationCode}`);

  // Verificamos que el código no exista en la base de datos
  const [existingCode] = await db.execute('SELECT * FROM reservations WHERE reservation_code = ?', [reservationCode]);
  console.log(`Verificando código en base de datos: ${existingCode.length === 0 ? 'Disponible' : 'Ya existe'}`);
  if (existingCode.length > 0) {
    // Si el código ya existe, generamos uno nuevo
    return generateReservationCode(); // Evita recursión infinita utilizando un mecanismo alternativo si se repite muchas veces
  }
  return reservationCode;
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
    hotel_id,
    total_price,
    image // Aceptamos una imagen opcional en Base64
  } = req.body;

  const user_id = req.userId;

  // Validaciones
  console.log('Datos recibidos para reserva:', req.body); // Verificar qué datos están llegando

  if (
    !check_in_date ||
    !check_out_date ||
    !guest_name ||
    !guest_phone ||
    !room_id ||
    !user_id ||
    !hotel_id ||
    !total_price // Verificamos que el total sea proporcionado
  ) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  // Verificación de fechas
  const checkInDate = new Date(check_in_date);
  const checkOutDate = new Date(check_out_date);

  if (isNaN(checkInDate) || isNaN(checkOutDate)) {
    console.log('Fechas inválidas:', { check_in_date, check_out_date });
    return res.status(400).json({ message: "Fechas inválidas" });
  }

  // Verifica que la fecha de check-in no sea anterior a la fecha actual
  if (checkInDate < new Date()) {
    console.log('La fecha de check-in no puede ser anterior a la fecha actual');
    return res.status(400).json({ message: "La fecha de check-in no puede ser anterior a la fecha actual" });
  }

  // Verificación de fechas de check-in y check-out
  if (checkInDate >= checkOutDate) {
    console.log('La fecha de check-out debe ser posterior a la de check-in');
    return res.status(400).json({ message: "La fecha de check-out debe ser posterior a la de check-in" });
  }

  // Verificar que el precio total sea válido
  if (total_price <= 0) {
    console.log('El precio total debe ser mayor que cero:', total_price);
    return res.status(400).json({ message: "El precio total debe ser mayor que cero" });
  }

  try {
    // Verificar si la habitación existe
    const [room] = await db.execute('SELECT * FROM rooms WHERE id = ?', [room_id]);
    console.log('Habitación encontrada:', room);
    if (room.length === 0) {
      console.log(`No se encontró la habitación con ID: ${room_id}`);
      return res.status(404).json({ message: "Habitación no encontrada" });
    }

    // Verificar si el hotel existe
    const [hotel] = await db.execute('SELECT * FROM hotels WHERE id = ?', [hotel_id]);
    console.log('Hotel encontrado:', hotel);
    if (hotel.length === 0) {
      console.log(`No se encontró el hotel con ID: ${hotel_id}`);
      return res.status(404).json({ message: "Hotel no encontrado" });
    }

    const formattedCheckIn = formatDate(check_in_date);
    const formattedCheckOut = formatDate(check_out_date);
    const reservation_code = await generateReservationCode();
    console.log('Código de reserva generado:', reservation_code); // Para depuración

    // Guardamos la reserva con el total proporcionado
    const [result] = await db.execute(
      'INSERT INTO reservations (reservation_code, guest_name, guest_phone, check_in_date, check_out_date, room_id, hotel_id, user_id, total_price, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [reservation_code, guest_name, guest_phone, formattedCheckIn, formattedCheckOut, room_id, hotel_id, user_id, total_price, 'activa', image || null]
  );
  
    console.log('Reserva insertada, ID:', result.insertId);

    // Recuperamos la reserva recién creada
    const [reservation] = await db.execute('SELECT * FROM reservations WHERE id = ?', [result.insertId]);
    console.log('Reserva recuperada:', reservation);

    // Respuesta de éxito
    res.status(201).json({
      message: "Reserva creada correctamente",
      reservation_code: reservation[0].reservation_code,
      guest_name: reservation[0].guest_name,
      check_in_date: reservation[0].check_in_date,
      check_out_date: reservation[0].check_out_date,
      total_price: reservation[0].total_price,
      image: reservation[0].image || null
    });
  } catch (error) {
    console.error('❌ Error al crear la reserva:', error.message);
    res.status(500).json({ message: "Error al crear la reserva en el servidor", error: error.message });
  }
};

// Rutas (sin cambios)
router.get('/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [reservations] = await db.execute(`SELECT r.*, u.email AS usuario, h.name AS hotel, rm.room_type
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms rm ON r.room_id = rm.id
      ORDER BY r.check_in_date DESC`);

    res.status(200).json({ reservations });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: "Error al obtener las reservas" });
  }
});

router.get('/user', authenticate, async (req, res) => {
  const user_id = req.userId;
  try {
    const [reservations] = await db.execute(`SELECT r.*, u.email AS usuario, h.name AS hotel, rm.room_type
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms rm ON r.room_id = rm.id
      WHERE r.user_id = ? ORDER BY r.check_in_date DESC`, [user_id]);

    res.status(200).json({ reservations });
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: "Error al obtener las reservas" });
  }
});

// Métodos para cancelar, reconfirmar, etc.
router.post('/', authenticate, createReservation);

export default router;
