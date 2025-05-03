import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, FileDown, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCheckOut, setFilterCheckOut] = useState(null);
  const [filterCheckIn, setFilterCheckIn] = useState(null);
  const [filterGuest, setFilterGuest] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      try {
        const response = await fetch(`${config.apiUrl}/api/reservation/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (Array.isArray(data.reservations)) {
          setReservations(data.reservations);
          setFilteredReservations(data.reservations);
        } else {
          console.error("La respuesta no contiene el array 'reservations'");
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
      }
    };

    fetchReservations();
  }, [navigate]);

  useEffect(() => {
    let filtered = reservations;

    if (filterStatus !== 'todos') {
      if (filterStatus === 'vencida') {
        const hoy = new Date();
        filtered = reservations.filter(res => new Date(res.check_out_date) < hoy && res.status === 'activa');
      } else {
        filtered = reservations.filter(res => res.status === filterStatus);
      }
    }

    if (filterCheckIn) {
      filtered = filtered.filter(res =>
        new Date(res.check_in_date).toLocaleDateString() === filterCheckIn.toLocaleDateString()
      );
    }
    if (filterCheckOut) {
      filtered = filtered.filter(res =>
        new Date(res.check_out_date).toLocaleDateString() === filterCheckOut.toLocaleDateString()
      );
    }
    

    if (filterGuest) {
      filtered = filtered.filter(res =>
        res.guest_name.toLowerCase().includes(filterGuest.toLowerCase())
      );
    }

    if (filterPhone) {
      filtered = filtered.filter(res =>
        res.guest_phone.includes(filterPhone)
      );
    }

    if (filterCode) {
      filtered = filtered.filter(res =>
        res.reservation_code.includes(filterCode)
      );
    }

    setFilteredReservations(filtered);
  }, [filterStatus, filterCheckIn, filterCheckOut, filterGuest, filterPhone, filterCode, reservations]);

  const handleDeleteReservation = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const confirmDelete = window.confirm('¿Estás seguro de eliminar esta reserva?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${config.apiUrl}/api/reservation/cancel/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setReservations(prev => prev.filter(res => res.id !== id));
        alert("Reserva cancelada correctamente");
      } else {
        alert('No se pudo eliminar la reserva.');
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error al eliminar la reserva.');
    }
  };

  const exportToPDF = async (reservation) => {
    const qrCanvas = document.getElementById(`qr-${reservation.id}`);
    const qrImage = await html2canvas(qrCanvas);
    const qrDataUrl = qrImage.toDataURL();

    const doc = new jsPDF();
    doc.text('Confirmación de Reserva', 20, 20);
    doc.text(`Código: ${reservation.reservation_code}`, 20, 30);
    doc.text(`Habitación: ${reservation.room_type}`, 20, 40);
    doc.text(`Descripción: ${reservation.description || 'No disponible'}`, 20, 50);
    doc.text(`Huésped: ${reservation.guest_name}`, 20, 60);
    doc.text(`Teléfono: ${reservation.guest_phone}`, 20, 70);
    doc.text(`Entrada: ${reservation.check_in_date}`, 20, 80);
    doc.text(`Salida: ${reservation.check_out_date}`, 20, 90);
    doc.text(`Noches: ${Math.ceil((new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) / (1000 * 60 * 60 * 24))}`, 20, 100);
    doc.text(`Total: $${reservation.total_price}`, 20, 110);
    doc.addImage(qrDataUrl, 'PNG', 20, 120, 40, 40);

    doc.save(`reserva_${reservation.reservation_code}.pdf`);
  };

  const printReservation = async (reservation) => {
    const qrElement = document.getElementById(`qr-${reservation.id}`);
    if (!qrElement) {
      alert('No se pudo encontrar el código QR para imprimir.');
      return;
    }
  
    const canvas = await html2canvas(qrElement);
    const qrDataUrl = canvas.toDataURL();
  
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html>
        <head><title>Reserva - ${reservation.reservation_code}</title></head>
        <body>
          <h2>Reserva #${reservation.reservation_code}</h2>
          <p><strong>Habitación:</strong> ${reservation.room_type}</p>
          <p><strong>Descripción:</strong> ${reservation.description || 'No disponible'}</p>
          <p><strong>Huésped:</strong> ${reservation.guest_name}</p>
          <p><strong>Teléfono:</strong> ${reservation.guest_phone}</p>
          <p><strong>Entrada:</strong> ${reservation.check_in_date}</p>
          <p><strong>Salida:</strong> ${reservation.check_out_date}</p>
          <p><strong>Noches:</strong> ${Math.ceil((new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) / (1000 * 60 * 60 * 24))}</p>
          <p><strong>Total:</strong> $${reservation.total_price}</p>
          <img src="${qrDataUrl}" alt="QR de la reserva" />
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  };
  

  const handleFilterChange = (status) => setFilterStatus(status);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'activa': return <CheckCircle size={20} color="green" />;
      case 'eliminada': return <XCircle size={20} color="red" />;
      case 'vencida': return <Clock size={20} color="orange" />;
      default: return null;
    }
  };

  const handlePayment = (reservation) => {
    alert(`Pago procesado para la reserva ${reservation.reservation_code} (simulado).`);
  };

  return (
    <div className="p-4" style={{ background: 'linear-gradient(to right, #6a11cb, #2575fc)' }}>
      <h2 className="text-white mb-4 text-center">Mis Reservas</h2>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button className="btn btn-light btn-sm" onClick={() => handleFilterChange('todos')}>Todos</button>
        <button className="btn btn-success btn-sm w-auto" onClick={() => handleFilterChange('activa')}>Activas</button>
        <button className="btn btn-warning btn-sm" onClick={() => handleFilterChange('vencida')}>Vencidas</button>
        <button className="btn btn-danger btn-sm" onClick={() => handleFilterChange('eliminada')}>Eliminadas</button>
        <DatePicker selected={filterCheckIn} onChange={setFilterCheckIn} className="form-control mb-2" placeholderText="fecha de entrada" />
        <DatePicker selected={filterCheckOut}onChange={setFilterCheckOut}className="form-control mb-2"placeholderText="fecha de salida"/>
        <input type="text" className="form-control mb-3 small w-auto " placeholder="Filtrar por huésped" value={filterGuest} onChange={e => setFilterGuest(e.target.value)} />
        <input type="text" className="form-control mb-3 small w-auto " placeholder="Filtrar por teléfono" value={filterPhone} onChange={e => setFilterPhone(e.target.value)} />
        <input type="text" className="form-control mb-3 small w-auto " placeholder="Filtrar por código" value={filterCode} onChange={e => setFilterCode(e.target.value)} />
        <button
  className="btn btn-outline-light btn-sm mb-3"
  onClick={() => {
    setFilterStatus('todos');
    setFilterCheckIn(null);
    setFilterCheckOut(null);
    setFilterGuest('');
    setFilterPhone('');
    setFilterCode('');
  }}
>
  Limpiar filtros
</button>

      </div>

      <div className="d-flex flex-wrap gap-3">
        {filteredReservations.map((reservation) => {
          const checkIn = new Date(reservation.check_in_date).toLocaleDateString();
          const checkOut = new Date(reservation.check_out_date).toLocaleDateString();
          const nights = Math.ceil((new Date(reservation.check_out_date) - new Date(reservation.check_in_date)) / (1000 * 60 * 60 * 24));

          return (
            <div key={reservation.id} className="card shadow-sm rounded-4" style={{ width: '100%', maxWidth: '600px' }}>
              <div className="row g-0">
                <div className="col-md-4">
                  <img
                    src={reservation.image ? `${process.env.PUBLIC_URL}/images/${reservation.image}` : "/images/default.jpg"}
                    alt="Habitación"
                    className="img-fluid rounded-start-4"
                    style={{ height: '40%', objectFit: 'cover' }}
                  />
                  <div className="d-flex flex-wrap gap-2 p-2">
                    <button className="btn btn-sm btn-primary w-100 me-2 " onClick={() => exportToPDF(reservation)} title="Descargar PDF"><FileDown size={16} />Descargar PDF</button>
                    <button className="btn btn-sm btn-secondary w-100 " onClick={() => printReservation(reservation)} title="Imprimir"><Printer size={16} />Imprimir</button>
                    <button className="btn btn-sm btn-success w-100 " onClick={() => handlePayment(reservation)} title="Pagar"><CreditCard size={16} />Pagar</button>
                    <button className="btn btn-sm btn-danger w-100  " onClick={() => handleDeleteReservation(reservation.id)} title="Cancelar">Cancelar</button>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="card-body p-3">
                    <h5 className="card-title mb-1">{reservation.room_type}</h5>
                    <p className="mb-1"><strong>Descripción:</strong> {reservation.description}</p>
                    <p className="mb-1"><strong>Huésped:</strong> {reservation.guest_name}</p>
                    <p className="mb-1"><strong>Teléfono:</strong> {reservation.guest_phone}</p>
                    <p className="mb-1"><strong>Entrada:</strong> {checkIn}</p>
                    <p className="mb-1"><strong>Salida:</strong> {checkOut}</p>
                    <p className="mb-1"><strong>Noches:</strong> {nights}</p>
                    <p className="mb-1"><strong>Total:</strong> ${reservation.total_price}</p>
                    <p className="mb-2"><strong>Estado:</strong> {getStatusIcon(reservation.status)} {reservation.status}</p>
                    <p className="mb-2"><strong>Código:</strong> {reservation.reservation_code}</p> 
                    <div className="text-center">
                      <h5>QR de la reserva</h5> 
                      <QRCodeCanvas id={`qr-${reservation.id}`} value={reservation.reservation_code} size={100} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reservations;
