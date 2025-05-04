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
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reservation/all`, {
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reservation/cancel/${id}`, {
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
  const getQRCodeImageData = (id) => {
    const svg = document.getElementById(id);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    });
  };
  const imprimirReserva = async (reserva) => {
    try {
      const qrImage = await getQRCodeImageData(`qr-${reserva.reservation_code}`);
      const ventana = window.open("", "_blank");
  
      ventana.document.write(`
        <html>
          <head>
            <title>Reserva ${reserva.reservation_code}</title>
          </head>
          <body>
            <h2>Reserva: ${reserva.reservation_code}</h2>
            <p>Hotel: ${reserva.hotel}</p>
            <p>Habitación: ${reserva.room_type}</p>
            <p>Nombre: ${reserva.guest_name}</p>
            <p>Teléfono: ${reserva.guest_phone}</p>
            <p>Check-in: ${reserva.check_in_date}</p>
            <p>Check-out: ${reserva.check_out_date}</p>
            <p>Noches: ${reserva.nights}</p>
            <p>Total: $${reserva.total_price}</p>
            <img src="${qrImage}" width="100" height="100" />
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      ventana.document.close();
    } catch (err) {
      console.error("Error al imprimir:", err);
    }
  };
  
  
  const generarPDF = async (reserva) => {
    try {
      const qrImage = await getQRCodeImageData(`qr-${reserva.reservation_code}`);
      const doc = new jsPDF();
  
      doc.setFontSize(12);
      doc.text(`Reserva: ${reserva.reservation_code}`, 10, 10);
      doc.text(`Hotel: ${reserva.hotel}`, 10, 20);
      doc.text(`Habitación: ${reserva.room_type}`, 10, 30);
      doc.text(`Nombre: ${reserva.guest_name}`, 10, 40);
      doc.text(`Teléfono: ${reserva.guest_phone}`, 10, 50);
      doc.text(`Check-in: ${reserva.check_in_date}`, 10, 60);
      doc.text(`Check-out: ${reserva.check_out_date}`, 10, 70);
      doc.text(`Noches: ${reserva.nights}`, 10, 80);
      doc.text(`Precio total: $${reserva.total_price}`, 10, 90);
  
      doc.addImage(qrImage, "PNG", 10, 100, 50, 50);
      doc.save(`reserva_${reserva.reservation_code}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
    }
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
    <div className="admin-container fade-in ">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary">Panel de Administración</h2>
        <LogoutButton />
      </div>

      <div className="d-flex justify-content-center">
  <div className="container mt-4">
    {/* Filtros de Estado */}
    <div className="d-flex justify-content-center gap-2 flex-wrap mb-4">
      {["activa", "pagada", "eliminada", "pasada", "todos"].map((estado) => (
        <button
          key={estado}
          className={`btn btn-${estado === "activa" ? "info" : estado === "pagada" ? "warning" : estado === "eliminada" ? "danger" : estado === "pasada" ? "secondary" : "primary"} ${estado === filtro ? "active" : ""} w-auto`}
          onClick={() => setFiltro(estado)}
        >
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </button>
      ))}
    </div>

    {/* Filtros de Hotel, Nombre, Teléfono, Código y Fechas */}
    <div className="d-flex flex-wrap gap-3 mb-4">
    <Select
  options={[{ value: "", label: "Todos los hoteles" }, ...hoteles.map(h => ({ value: h, label: h }))]}
  onChange={option => setHotelFiltro(option ? option.value : "")}
  isClearable
  placeholder="Hotel"
  className="w-100 w-md-auto"
  value={hotelFiltro ? { value: hotelFiltro, label: hotelFiltro } : null}
/>


      <Select
        options={nombres.map(n => ({ value: n, label: n }))}
        onChange={option => setNombreFiltro(option ? option.value : "")}
        isClearable
        placeholder="Nombre"
        className="w-100 w-md-auto form-control-sm p-2"
      />

      <Select
        options={telefonos.map(t => ({ value: t, label: t }))}
        onChange={option => setTelefonoFiltro(option ? option.value : "")}
        isClearable
        placeholder="Teléfono"
        className="w-100 w-md-auto form-control-sm p-2"
      />

      <Select
        options={codigos.map(c => ({ value: c, label: c }))}
        onChange={option => setCodigoFiltro(option ? option.value : "")}
        isClearable
        placeholder="Código"
        className="w-100 w-md-auto form-control-sm p-2"
      />

      <DatePicker
        selected={checkInFiltro}
        onChange={(date) => setCheckInFiltro(date)}
        placeholderText="Check-in"
        className="form-control form-control-sm p-2 w-100 w-md-auto"
        dateFormat="yyyy-MM-dd"
      />

      <DatePicker
        selected={checkOutFiltro}
        onChange={(date) => setCheckOutFiltro(date)}
        placeholderText="Check-out"
        className="form-control form-control-sm p-2 w-100 w-md-auto"
        dateFormat="yyyy-MM-dd"
      />

      <button className="btn btn-outline-primary rounded-pill w-100 w-md-auto" onClick={() => {
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
  </div>
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
                <p><strong>Estado:</strong> {reserva.status}</p>
              </p>

              <div className="text-center my-3">
  <QRCodeSVG
    value={reserva.reservation_code}
    size={100}
    id={`qr-${reserva.reservation_code}`}
  />
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
    <button
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  className="btn btn-light position-fixed d-flex align-items-center justify-content-center"
  style={{
    bottom: '20px',
    right: '20px',
    borderRadius: '50%',
    width: '55px',
    height: '55px',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
  }}
  title="Volver arriba"
>
  <i className="bi bi-arrow-up fs-4 text-primary"></i>
</button>

  </div>
</div>
  );
};

export default Admin;
