import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { QRCodeCanvas } from 'qrcode.react';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const response = await fetch(`${config.apiUrl}/api/reservations/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          console.log(data); // Verifica la estructura de la respuesta
          setReservations(data.reservations || []); // Asegúrate de que data.reservations exista
        } else {
          alert('No se pudieron cargar las reservas');
        }
      } catch (error) {
        console.error(error);
        alert('Error al cargar las reservas');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  const handleDeleteReservation = async (reservationId) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const confirmDelete = window.confirm('¿Estás seguro de eliminar esta reserva?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${config.apiUrl}/api/reservations/cancel/${reservationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setReservations((prev) => prev.filter((res) => res.id !== reservationId));
        alert("Reserva cancelada correctamente");
      } else {
        alert('No se pudo eliminar la reserva.');
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error al eliminar la reserva.');
    }
  };

  return (
    <div className="container mt-4">
      {loading ? (
        <div>Loading...</div>
      ) : (
        reservations.length === 0 ? (
          <div>No tienes reservas.</div>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              className={`card mb-3 ${reservation.status === 'eliminada' ? 'bg-light' : 'bg-white'}`}
              style={{ maxWidth: '720px', margin: '0 auto' }}
            >
              <div className="row g-0">
                <div className="col-md-4">
                  {/* Mostrar imagen de la habitación */}
                  <img
                    src={`/images/habitacion${reservation.room_id}.jpg`} // Ruta correcta
                    alt={reservation.room_type}
                    className="img-fluid rounded-start"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title">{reservation.room_type}</h5>
                    <p className="card-text">{reservation.guest_name}</p>
                    <p className="card-text">{reservation.hotel}</p>
                    <p className="card-text">
                      <small className="text-muted">
                        Fechas: {new Date(reservation.check_in_date).toLocaleDateString()} -{' '}{new Date(reservation.check_out_date).toLocaleDateString()}
                      </small>
                    </p>

                    {/* Mostrar código QR */}
                    <div className="text-center mb-3">
                      <QRCodeCanvas value={reservation.reservation_code} size={100} level="H" includeMargin={true} />
                      <p>
                        <strong>Código:</strong> {reservation.reservation_code}
                      </p>
                    </div>

                    {/* Botones de acción */}
                    {reservation.status !== 'eliminada' ? (
                      <>
                        <button
                          className="btn btn-danger me-2"
                          onClick={() => handleDeleteReservation(reservation.id)}
                        >
                          Eliminar Reserva
                        </button>

                        <a href="https://registro.pse.com.co/PSEUserRegister/" target="_blank" rel="noopener noreferrer">
                          <button className="btn btn-success">
                            Pagar Reserva
                          </button>
                        </a>
                      </>
                    ) : (
                      <button className="btn btn-secondary" disabled>
                        Reserva Eliminada
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default Reservations;
