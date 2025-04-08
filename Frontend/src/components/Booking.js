import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import config from "../config";
import Navbar from "./Navbar";
import { jwtDecode } from "jwt-decode";

const Booking = () => {
  const [rooms, setRooms] = useState([]);
  const [formDataByRoom, setFormDataByRoom] = useState({});
  const [messageByRoom, setMessageByRoom] = useState({});
  const navigate = useNavigate();
  const hotelId = 1;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/rooms/${hotelId}/available`);
        const data = await response.json();

        if (response.ok && data.rooms?.length > 0) {
          setRooms(data.rooms);
          const initialFormData = {};
          const initialMessages = {};
          data.rooms.forEach((room) => {
            initialFormData[room.id] = {
              guest_name: "",
              guest_phone: "",
              check_in_date: "",
              check_out_date: "",
              num_people: 1,
              total: 0,
              nights: 0,
            };
            initialMessages[room.id] = "";
          });
          setFormDataByRoom(initialFormData);
          setMessageByRoom(initialMessages);
        } else {
          setMessageByRoom({ general: "No hay habitaciones disponibles." });
        }
      } catch (error) {
        console.error("Error al cargar habitaciones:", error);
        setMessageByRoom({ general: "Error en la solicitud de habitaciones." });
      }
    };

    fetchAvailableRooms();
  }, []);

  const calculateDays = (checkIn, checkOut) => {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (isNaN(inDate) || isNaN(outDate) || outDate <= inDate) return 0;
    return Math.ceil((outDate - inDate) / (1000 * 3600 * 24));
  };

  const handleInputChange = (roomId, field, value) => {
    setFormDataByRoom((prev) => {
      const updated = { ...prev };
      updated[roomId] = { ...updated[roomId], [field]: value };

      if (field === "check_in_date" || field === "check_out_date") {
        const { check_in_date, check_out_date } = updated[roomId];
        const roomPrice = rooms.find((room) => room.id === roomId)?.price;

        if (check_in_date && check_out_date && roomPrice) {
          const nights = calculateDays(check_in_date, check_out_date);
          updated[roomId].total = nights * roomPrice;
          updated[roomId].nights = nights;
        }
      }

      return updated;
    });
  };

  const handleBooking = (e, roomId) => {
    e.preventDefault();
    const formData = formDataByRoom[roomId];

    // Validaciones de los campos del formulario
    if (!formData.guest_name || !formData.guest_phone || !formData.check_in_date || !formData.check_out_date) {
      setMessageByRoom((prev) => ({ ...prev, [roomId]: "Todos los campos son obligatorios." }));
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.guest_phone)) {
      setMessageByRoom((prev) => ({ ...prev, [roomId]: "El teléfono debe tener 10 dígitos." }));
      return;
    }

    if (formData.check_out_date <= formData.check_in_date) {
      setMessageByRoom((prev) => ({ ...prev, [roomId]: "La fecha de salida debe ser posterior a la de entrada." }));
      return;
    }

    if (!token) {
      setMessageByRoom((prev) => ({ ...prev, [roomId]: "Inicia sesión para hacer una reserva." }));
      return;
    }

    let userId;
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    } catch (error) {
      setMessageByRoom((prev) => ({ ...prev, [roomId]: "Token inválido. Por favor, inicia sesión de nuevo." }));
      return;
    }

    const reservation_code = generateReservationCode();

    // Preparar la información para pasar al componente de confirmación
    navigate("/confirmacion", {
      state: {
        ...formData,
        hotel_id: hotelId,
        room_id: roomId,
        user_id: userId,
        reservation_code,
      },
    });
  };

  const generateReservationCode = () => {
    return (
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      Math.floor(1000 + Math.random() * 9000)
    );
  };

  return (
    <div
      className="container-fluid p-0"
      style={{ background: "linear-gradient(to right, #6a11cb, #2575fc)", minHeight: "100vh" }}
    >
      <Navbar />
      <h2 className="text-center mb-5 text-white">Reserva tu habitación</h2>

      {messageByRoom.general && (
        <div className="alert alert-warning text-center">{messageByRoom.general}</div>
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
        {rooms.map((room) => {
          const formData = formDataByRoom[room.id] || {};
          const total = formData.total || 0;
          const nights = formData.nights || 0;

          return (
            <div key={room.id} className="col">
              <div
                className="card shadow-sm border-0 rounded-4"
                style={{ maxWidth: "360px", margin: "0 auto", height: "100%" }}
              >
                <img
                  src={`/images/${room.image}`}
                  alt={room.room_type}
                  className="card-img-top rounded-top-4"
                  style={{ height: "180px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column" style={{ minHeight: "300px" }}>
                  <h5 className="card-title fw-bold">{room.room_type}</h5>
                  <p className="card-text text-muted" style={{ fontSize: "0.9rem" }}>{room.description}</p>
                  <span className="badge text-bg-success mb-3 p-2">
                    <i className="bi bi-currency-dollar"></i> {room.price} por noche
                  </span>

                  <form onSubmit={(e) => handleBooking(e, room.id)} style={{ flex: 1 }}>
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nombre del huésped"
                        value={formData.guest_name || ""}
                        onChange={(e) => handleInputChange(room.id, "guest_name", e.target.value)}
                      />
                    </div>
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Teléfono del huésped"
                        value={formData.guest_phone || ""}
                        onChange={(e) => handleInputChange(room.id, "guest_phone", e.target.value)}
                      />
                    </div>
                    <div className="d-flex gap-2 mb-2">
                      <input
                        type="date"
                        className="form-control"
                        value={formData.check_in_date || ""}
                        onChange={(e) => handleInputChange(room.id, "check_in_date", e.target.value)}
                      />
                      <input
                        type="date"
                        className="form-control"
                        value={formData.check_out_date || ""}
                        onChange={(e) => handleInputChange(room.id, "check_out_date", e.target.value)}
                      />
                    </div>

                    {nights > 0 && (
                      <div className="alert alert-info p-2 mb-2">
                        <small className="d-block">
                          <i className="bi bi-moon-fill"></i> Noches: <strong>{nights}</strong>
                        </small>
                        <small className="d-block">
                          <i className="bi bi-cash-coin"></i> Total: <strong>${total}</strong>
                        </small>
                      </div>
                    )}

                    {messageByRoom[room.id] && (
                      <div className="alert alert-danger text-center p-2">
                        {messageByRoom[room.id]}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary w-100 mt-2">
                      <i className="bi bi-check-circle me-2"></i> Reservar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Booking;
