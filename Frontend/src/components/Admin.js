import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../index.css";

const Admin = () => {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [hotelFiltro, setHotelFiltro] = useState("");
  const [nombreFiltro, setNombreFiltro] = useState("");
  const [telefonoFiltro, setTelefonoFiltro] = useState("");
  const [codigoFiltro, setCodigoFiltro] = useState("");
  const [checkInFiltro, setCheckInFiltro] = useState(null);
  const [checkOutFiltro, setCheckOutFiltro] = useState(null);
  const [nombres, setNombres] = useState([]);
  const [telefonos, setTelefonos] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user")) : null;

  useEffect(() => {
    if (!token || user?.role?.toLowerCase() !== "admin") {
      setMensaje("Acceso denegado. Debes ser administrador.");
      navigate("/login");
      return;
    }

    const fetchReservas = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/reservation/all", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          setMensaje(errorData.message || "Error al obtener las reservas");
          return;
        }

        const data = await res.json();
        setReservas(Array.isArray(data.reservations) ? data.reservations : []);
        setNombres([...new Set(data.reservations.map(r => r.guest_name))]);
        setTelefonos([...new Set(data.reservations.map(r => r.guest_phone))]);
        setCodigos([...new Set(data.reservations.map(r => r.reservation_code))]);
      } catch (err) {
        console.error("Error al obtener las reservas:", err);
        setMensaje("Error al obtener las reservas.");
      }
    };

    fetchReservas();
  }, [navigate, token, user]);

  const cancelarReserva = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reservation/cancel/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (res.ok) {
        setReservas((prev) => prev.filter((r) => r.id !== id));
        alert(result.message || "Reserva cancelada correctamente.");
      } else {
        alert(result.message || "No se pudo cancelar la reserva.");
      }
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      alert("Error al cancelar la reserva.");
    }
  };

  const imprimirReserva = (reserva) => {
    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html><head><title>Reserva ${reserva.reservation_code}</title><style>
        body { font-family: Arial; padding: 20px; }
        h2 { color: #007bff; }
        p { margin: 5px 0; }
      </style></head><body>
      <h2>Detalles de la Reserva</h2>
      <p><strong>Código:</strong> ${reserva.reservation_code}</p>
      <p><strong>Hotel:</strong> ${reserva.hotel}</p>
      <p><strong>Habitación:</strong> ${reserva.room_type}</p>
      <p><strong>Nombre:</strong> ${reserva.guest_name}</p>
      <p><strong>Teléfono:</strong> ${reserva.guest_phone}</p>
      <p><strong>Check-in:</strong> ${reserva.check_in_date}</p>
      <p><strong>Check-out:</strong> ${reserva.check_out_date}</p>
      <p><strong>Noches:</strong> ${reserva.nights}</p>
      <p><strong>Precio total:</strong> $${reserva.total_price}</p>
      </body></html>`);
    ventana.document.close();
    ventana.print();
  };

  const generarPDF = (reserva) => {
    const doc = new jsPDF();
    doc.text(`Reserva: ${reserva.reservation_code}`, 10, 10);
    doc.text(`Hotel: ${reserva.hotel}`, 10, 20);
    doc.text(`Tipo de habitación: ${reserva.room_type}`, 10, 30);
    doc.text(`Nombre del huésped: ${reserva.guest_name}`, 10, 40);
    doc.text(`Teléfono: ${reserva.guest_phone}`, 10, 50);
    doc.text(`Check-in: ${reserva.check_in_date}`, 10, 60);
    doc.text(`Check-out: ${reserva.check_out_date}`, 10, 70);
    doc.text(`Noches: ${reserva.nights}`, 10, 80);
    doc.text(`Precio total: $${reserva.total_price}`, 10, 90);
    doc.save(`reserva_${reserva.reservation_code}.pdf`);
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    const matchEstado = filtro === "todos" || reserva.status === filtro;
    const matchHotel = hotelFiltro === "" || reserva.hotel === hotelFiltro;
    const matchNombre = nombreFiltro === "" || reserva.guest_name.toLowerCase().includes(nombreFiltro.toLowerCase());
    const matchTelefono = telefonoFiltro === "" || reserva.guest_phone.includes(telefonoFiltro);
    const matchCodigo = codigoFiltro === "" || reserva.reservation_code.toLowerCase().includes(codigoFiltro.toLowerCase());
    const matchCheckIn = !checkInFiltro || new Date(reserva.check_in_date).toDateString() === checkInFiltro.toDateString();
    const matchCheckOut = !checkOutFiltro || new Date(reserva.check_out_date).toDateString() === checkOutFiltro.toDateString();
    return matchEstado && matchHotel && matchNombre && matchTelefono && matchCodigo && matchCheckIn && matchCheckOut;
  });

  const hoteles = [...new Set(reservas.map((r) => r.hotel))];

  return (
    <div className="admin-container fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Panel de Administración</h2>
        <LogoutButton />
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
        <div className="btn-group">
          {["activa", "pagada", "eliminada", "pasada", "todos"].map((estado) => (
            <button
              key={estado}
              className={`btn btn-${estado === "activa" ? "info" : estado === "pagada" ? "warning" : estado === "eliminada" ? "danger" : estado === "pasada" ? "secondary" : "light"}`}
              onClick={() => setFiltro(estado)}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>

        <select className="form-select w-auto" value={hotelFiltro} onChange={(e) => setHotelFiltro(e.target.value)}>
          <option value="">Todos los hoteles</option>
          {hoteles.map((h, i) => <option key={i} value={h}>{h}</option>)}
        </select>

        <Select
          options={nombres.map(n => ({ value: n, label: n }))}
          onChange={option => setNombreFiltro(option ? option.value : "")}
          isClearable
          placeholder="Nombre"
          className="w-auto"
        />

        <Select
          options={telefonos.map(t => ({ value: t, label: t }))}
          onChange={option => setTelefonoFiltro(option ? option.value : "")}
          isClearable
          placeholder="Teléfono"
          className="w-auto"
        />

        <Select
          options={codigos.map(c => ({ value: c, label: c }))}
          onChange={option => setCodigoFiltro(option ? option.value : "")}
          isClearable
          placeholder="Código"
          className="w-auto"
        />

        <DatePicker
          selected={checkInFiltro} onChange={(date) => setCheckInFiltro(date)} placeholderText="Check-in" className="form-control" dateFormat="yyyy-MM-dd" /> <DatePicker selected={checkOutFiltro} onChange={(date) => setCheckOutFiltro(date)} placeholderText="Check-out" className="form-control" dateFormat="yyyy-MM-dd" />
    <button className="btn btn-secondary" onClick={() => {
      setNombreFiltro("");
      setTelefonoFiltro("");
      setCodigoFiltro("");
      setCheckInFiltro(null);
      setCheckOutFiltro(null);
      setHotelFiltro("");
      setFiltro("todos");
    }}>
      Limpiar Filtros
    </button>
  </div>

  {mensaje && <div className="alert alert-danger">{mensaje}</div>}

  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
    {reservasFiltradas.length === 0 ? (
      <p>No hay reservas registradas.</p>
    ) : (
      reservasFiltradas.map((reserva) => (
        <div className="col mb-4" key={reserva.id}>
          <div className="card h-100">
          <img src={reserva.image ? `/images/${reserva.image}` : "/images/default.jpg"} alt="Imagen" className="card-img-top" style={{ height: "200px", objectFit: "cover" }} />
            <div className="card-body">
              <h5 className="card-title">
                {reserva.reservation_code}
                {" "}
                {reserva.status === "activa" && <i className="bi bi-check-circle text-success ms-2" />}
                {reserva.status === "eliminada" && <i className="bi bi-x-circle text-danger ms-2" />}
                {reserva.status === "pagada" && <i className="bi bi-wallet text-warning ms-2" />}
                {reserva.status === "pasada" && <i className="bi bi-calendar-x text-muted ms-2" />}
              </h5>
              <p className="card-text">
                <strong>Hotel:</strong> {reserva.hotel}<br />
                <strong>Habitación:</strong> {reserva.room_type}<br />
                <strong>Huésped:</strong> {reserva.guest_name}<br />
                <strong>Teléfono:</strong> {reserva.guest_phone}<br />
                <strong>Check-in:</strong> {reserva.check_in_date}<br />
                <strong>Check-out:</strong> {reserva.check_out_date}<br />
                <strong>Noches:</strong> {reserva.nights}<br />
                <strong>Precio total:</strong> ${reserva.total_price}
              </p>

              <div className="text-center my-3">
                <QRCodeSVG value={reserva.reservation_code} size={100} />
              </div>

              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  className="btn btn-primary"
                  style={{ maxWidth: "5cm" }}
                  onClick={() => imprimirReserva(reserva)}
                >
                  Imprimir
                </button>

                <button
                  className="btn btn-success"
                  style={{ maxWidth: "5cm" }}
                  onClick={() => generarPDF(reserva)}
                >
                  PDF
                </button>

                <button
                  className="btn btn-danger"
                  style={{ maxWidth: "5cm" }}
                  onClick={() => cancelarReserva(reserva.id)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>
  );
};

export default Admin;
