import { request, response } from "express";
import db from "../db"; // Asegúrate de que tu conexión a la base de datos esté configurada correctamente

// Función para crear una nueva reserva
export const createReservation = async (request, response) => {
    try {
        const { guest_name, guest_phone, check_in_date, check_out_date, room_id, hotel_id, user_id, image, total_price, } = request.body;

        // Validación de los datos de forma específica
        if (!guest_name || !guest_phone || !check_in_date || !check_out_date || !room_id || !hotel_id || !user_id || !total_price) {
            return response.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // Log para ver los datos que llegan en la solicitud
        console.log(`Reserva creada: 
          guest_name: ${guest_name}, guest_phone: ${guest_phone}, 
          check_in_date: ${check_in_date}, check_out_date: ${check_out_date}, 
          room_id: ${room_id}, hotel_id: ${hotel_id}, user_id: ${user_id}, 
          image: ${image || 'Ninguna imagen'} total_price: ${total_price}`);

        // Verificar que la habitación esté disponible
        const [room] = await db.query(
            "SELECT * FROM rooms WHERE id = ? AND hotel_id = ? AND id NOT IN (SELECT room_id FROM reservations WHERE check_in_date <= ? AND check_out_date >= ?)",
            [room_id, hotel_id, check_out_date, check_in_date]
        );

        if (!room) {
            return response.status(404).json({ message: "Habitación no disponible para las fechas seleccionadas." });
        }

        // Cálculo de noches y precio total
        const nights = calculateDays(check_in_date, check_out_date);
        if (nights <= 0) {
            return response.status(400).json({ message: "Las fechas de entrada y salida no son válidas." });
        }

        const total = nights * room.price;  // Suponiendo que 'price' es el precio por noche de la habitación

        // Generación del código de reserva
        const reservationCode = await generateReservationCode();

        // Crear la reserva en la base de datos
        const [result] = await db.query(
            "INSERT INTO reservations (reservation_code, guest_name, guest_phone, check_in_date, check_out_date, room_id, hotel_id, user_id, total_price, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [reservationCode, guest_name, guest_phone, check_in_date, check_out_date, room_id, hotel_id, user_id, total_price, "activa", image || null]
        );
        
        
        // Respuesta con la información de la reserva
        const newReservation = {
            reservation_code: reservationCode,
            guest_name,
            guest_phone,
            check_in_date,
            check_out_date,
            room_id,
            hotel_id,
            user_id,
            total_price,
            status: "activa",
            image: image || null
        };

        return response.status(201).json({ reservation: newReservation });
    } catch (error) {
        console.error("Error al crear la reserva:", error);
        return response.status(500).json({ message: "Error al crear la reserva." });
    }
};

// Función para calcular los días entre dos fechas
const calculateDays = (checkIn, checkOut) => {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (isNaN(inDate) || isNaN(outDate) || outDate <= inDate) return 0;
    return Math.ceil((outDate - inDate) / (1000 * 3600 * 24));
};

// Función para generar un código de reserva único
const generateReservationCode = async () => {
    let reservationCode;
    let isCodeUnique = false;

    // Generar un código único
    while (!isCodeUnique) {
        // Generamos un código de reserva aleatorio
        reservationCode = 'RES-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Verificar que el código no exista en la base de datos
        const [existingCode] = await db.query("SELECT * FROM reservations WHERE reservation_code = ?", [reservationCode]);

        if (existingCode.length === 0) {
            isCodeUnique = true;  // Si el código es único, salimos del bucle
        }
    }

    return reservationCode;
};
