const API_BASE_URL = "http://localhost:5000/api/reservations";

// ✅ Crear reserva
export const createReservation = async (reservationData, token) => {
  try {
    if (!reservationData.hotel_id || !reservationData.room_id) {
      throw new Error("Faltan parámetros importantes para la reserva (hotel_id, room_id).");
    }

    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reservationData),
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || "No se pudo guardar la reserva.");
      } else {
        const text = await response.text();
        throw new Error(text || "Error del servidor inesperado.");
      }
    }

    const data = await response.json();
    if (!data.reservation) {
      throw new Error("No se ha creado la reserva correctamente.");
    }

    return { ok: true, reservation: data.reservation };
  } catch (error) {
    console.error("❌ Error en createReservation:", error);
    throw error;
  }
};

// ✅ Obtener reservas del usuario
export const fetchUserReservations = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Error al obtener las reservas.");
    }

    const data = await response.json();
    return data.reservations;
  } catch (error) {
    console.error("❌ Error al obtener reservas del usuario:", error);
    throw error;
  }
};

// ✅ Cancelar una reserva
export const cancelReservation = async (reservationId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cancel/${reservationId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Error al cancelar la reserva.");
    }

    return data;
  } catch (error) {
    console.error("❌ Error al cancelar la reserva:", error);
    throw error;
  }
};

// ✅ Reconfirmar una reserva cancelada
export const reconfirmReservation = async (reservationId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reconfirm/${reservationId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Error al reconfirmar la reserva.");
    }

    return data;
  } catch (error) {
    console.error("❌ Error al reconfirmar la reserva:", error);
    throw error;
  }
};
