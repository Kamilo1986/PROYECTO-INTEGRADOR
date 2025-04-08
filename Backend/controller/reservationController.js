import { request, response } from "express";
import db from "../db"; // Aquí importamos nuestra conexión a la base de datos

// Función para crear una nueva reserva
export const createReservation = async (request, response) => {
    try {
        const { guest_name, guest_phone, check_in_date, check_out_date, room_id, hotel_id, user_id } = request.body;

        // Validación de los datos
        if (!guest_name || !guest_phone || !check_in_date || !check_out_date || !room_id || !hotel_id || !user_id) {
            return response.status(400).json({ message: "Todos los campos son obligatorios." });
        }

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

        const total = nights * room.price;

        // Crear la reserva en la base de datos
        const [result] = await db.query(
            "INSERT INTO reservations (guest_name, guest_phone, check_in_date, check_out_date, room_id, hotel_id, user_id, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [guest_name, guest_phone, check_in_date, check_out_date, room_id, hotel_id, user_id, total]
        );

        // Respuesta con la información de la reserva
        const newReservation = {
            id: result.insertId,
            guest_name,
            guest_phone,
            check_in_date,
            check_out_date,
            room_id,
            hotel_id,
            user_id,
            total
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
