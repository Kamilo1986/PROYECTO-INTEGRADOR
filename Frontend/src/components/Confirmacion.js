import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import config from "../config";
import Navbar from "../components/Navbar";

const Confirmacion = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [reservationCode, setReservationCode] = useState("");

  const calculateNights = (checkInDate, checkOutDate) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const differenceInTime = checkOut - checkIn;
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toISOString().split("T")[0];
  };

  useEffect(() => {
    console.log("📦 state recibido en Confirmacion:", state);

    let isMounted = true;

    const fetchRoomDetails = async () => {
      if (!state?.room_id) {
        console.error("🚫 No se encontró el ID de la habitación (room_id) en el state.");
        setErrorMessage("No se pudo obtener la información de la habitación.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${config.apiUrl}/api/rooms/room/${state.room_id}`);
        const data = await response.json();
        if (isMounted && response.ok && data.room) {
          setRoomDetails(data.room);
        } 
      } catch (error) {
        console.error("Error al obtener detalles de la habitación:", error);
        setErrorMessage("Error al cargar los detalles de la habitación.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!state) {
      navigate("/");
    } else {
      fetchRoomDetails();
      setReservationCode(state?.reservation_code || "");
    }

    return () => {
      isMounted = false;
    };
  }, [state, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!roomDetails && errorMessage) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        {errorMessage}
      </div>
    );
  }

  const { room_type, description, price, image } = roomDetails;
  const nights = calculateNights(state.check_in_date, state.check_out_date);
  const total = price * nights;

  return (
    <div className="container-fluid p-0" style={{ background: "linear-gradient(to right, #6a11cb, #2575fc)", minHeight: "100vh" }}>
      <Navbar />
      <h2 className="text-center mb-5 text-white">Confirmación de la reserva</h2>

      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-lg border-0 rounded-3">
            <img
              src={`/images/${image}`}
              alt={room_type}
              className="card-img-top rounded-top"
              style={{ height: "180px", objectFit: "cover" }}
            />
            <div className="card-body">
              <h5 className="card-title text-primary">{room_type}</h5>
              <p className="card-text">{description}</p>
              <p className="card-text fw-bold text-success">Precio por noche: ${price}</p>

              <div className="alert alert-info">
                <p><strong>Nombre del huésped:</strong> {state.guest_name}</p>
                <p><strong>Teléfono del huésped:</strong> {state.guest_phone}</p>
                <p><strong>Fechas:</strong> {formatDate(state.check_in_date)} - {formatDate(state.check_out_date)}</p>
                <p><strong>Total noches:</strong> {nights}</p>
                <p><strong>Total:</strong> ${total.toFixed(2)}</p>
              </div>

              <div className="d-flex justify-content-center">
                <QRCode value={reservationCode} size={128} />
              </div>
              <p className="text-center mt-3 text-muted">Código de reserva: {reservationCode}</p>

              <div className="d-flex justify-content-center mt-4">
                <a href="https://registro.pse.com.co/PSEUserRegister/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Ir a Pago
                </a>
              </div>

              {errorMessage && (
                <div className="alert alert-danger mt-4" role="alert">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;
