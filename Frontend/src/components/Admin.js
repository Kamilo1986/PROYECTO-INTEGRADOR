import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../index.css"; // Asegúrate de que el archivo CSS esté importado

const Admin = () => {
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role?.toLowerCase();

    if (!token || role !== "admin") {
      setMensaje("Acceso denegado. Debes ser administrador.");
      navigate("/login");
      return;
    }

    const fetchDatos = async () => {
      try {
        const resReservas = await fetch("http://localhost:5000/api/reservas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataReservas = await resReservas.json();

        const resRooms = await fetch("http://localhost:5000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataRooms = await resRooms.json();

        if (resReservas.ok) setReservas(dataReservas);
        if (resRooms.ok) setHabitaciones(dataRooms);
      } catch (err) {
        console.error("Error cargando datos del admin:", err);
        setMensaje("Error al cargar datos del administrador.");
      }
    };

    fetchDatos();
  }, [navigate]);

  return (
    <div className="admin-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Panel de Administración</h2>
        <LogoutButton />
      </div>

      {mensaje && <div className="alert alert-danger">{mensaje}</div>}

      {/* Sección de reservas */}
      <div className="mb-5">
        <h4 className="text-success">Reservas actuales</h4>
        {reservas.length === 0 ? (
          <p>No hay reservas registradas.</p>
        ) : (
          <table className="table table-hover table-bordered">
            <thead>
              <tr className="table-primary">
                <th>Huésped</th>
                <th>Teléfono</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Habitación</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id}>
                  <td>{r.guest_name}</td>
                  <td>{r.guest_phone}</td>
                  <td>{r.check_in_date}</td>
                  <td>{r.check_out_date}</td>
                  <td>{r.room_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sección de habitaciones */}
      <div>
        <h4 className="text-info">Habitaciones</h4>
        {habitaciones.length === 0 ? (
          <p>No hay habitaciones registradas.</p>
        ) : (
          <ul className="list-group">
            {habitaciones.map((room) => (
              <li
                key={room.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  <strong>{room.room_type}</strong> - ${room.price} - Capacidad: {room.capacity}
                </span>
                <button className="btn btn-sm btn-primary">Editar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;
