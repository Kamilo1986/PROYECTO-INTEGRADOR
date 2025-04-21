import { useLocation } from "react-router-dom";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";

const Confirmacion = () => {
  const { state } = useLocation();
  const { booking } = state || {};

  // Usar hooks al inicio
  const [qrCodeUrl, setQrCodeUrl] = useState(null); // Siempre se ejecuta

  // Verificar si booking existe antes de continuar con la lógica
  useEffect(() => {
    const generateQRCode = async () => {
      if (booking) {
        try {
          const qrCode = await QRCode.toDataURL(booking.reservation_code, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 100,
          });
          setQrCodeUrl(qrCode); // Actualiza el estado con la URL del QR
        } catch (error) {
          console.error("Error generando el código QR:", error);
        }
      }
    };

    // Solo ejecutar si booking tiene valor
    if (booking) {
      generateQRCode(); 
    }
  }, [booking]); // Aseguramos que el efecto solo se ejecute cuando 'booking' cambie

  // Si no hay datos de la reserva, mostrar un mensaje de error
  if (!booking) {
    return <div>No se encontraron los datos de la reserva.</div>;
  }

  // Formatear fechas
  const checkInDate = new Date(booking.check_in_date).toLocaleDateString();
  const checkOutDate = new Date(booking.check_out_date).toLocaleDateString();

  // Calcular noches
  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    doc.text(`Código de Reserva: ${booking.reservation_code}`, 10, 10);
    doc.text(`Nombre del Huésped: ${booking.guest_name}`, 10, 20);
    doc.text(`Número Telefónico: ${booking.guest_phone}`, 10, 30);
    doc.text(`Fecha de Entrada: ${checkInDate}`, 10, 40);
    doc.text(`Fecha de Salida: ${checkOutDate}`, 10, 50);
    doc.text(`Noches: ${nights}`, 10, 60);
    doc.text(`Total a Pagar: ${booking.total_price}`, 10, 70);

    if (qrCodeUrl) {
      doc.addImage(qrCodeUrl, 'PNG', 10, 80, 50, 50);
    }

    doc.save('reserva.pdf');
  };

  const handlePrint = () => {
    const printContent = document.querySelector(".container").innerHTML;
    const newWindow = window.open();
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="container py-3">
      <h2 className="text-center mb-4 text-primary">Confirmación de Reserva</h2>

      <div className="card shadow-sm border-0 rounded-3" style={{ maxWidth: "350px", margin: "auto", padding: "10px" }}>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-primary fw-bold">Reserva Confirmada</h5>
          <p className="card-text text-muted" style={{ fontSize: "14px" }}>¡Gracias por tu reserva!</p>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Código de reserva:</strong> {booking.reservation_code || "No disponible"}
          </div>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Nombre de la habitación:</strong> {booking.room_name || "No definido"}
          </div>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Descripción:</strong> {booking.room_description || "Descripción no disponible"}
          </div>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Nombre del huésped:</strong> {booking.guest_name || "No proporcionado"}
          </div>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Número telefónico:</strong> {booking.guest_phone || "No proporcionado"}
          </div>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Fecha de entrada:</strong> {checkInDate}
          </div>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Fecha de salida:</strong> {checkOutDate}
          </div>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Noches:</strong> {nights || 0}
          </div>

          <div className="mb-2" style={{ fontSize: "14px" }}>
            <strong>Total a pagar:</strong> {booking.total_price.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </div>

          <div className="d-flex justify-content-center" style={{ marginBottom: "10px" }}>
            {booking.image ? (
              <img
                src={`${process.env.PUBLIC_URL}/images/${booking.image}`}
                alt="Habitación reservada"
                className="img-fluid"
                style={{ maxWidth: "250px", borderRadius: "10px" }}
              />
            ) : (
              <img
                src="/images/default.jpg"
                alt="Imagen de habitación por defecto"
                className="img-fluid"
                style={{ maxWidth: "250px", borderRadius: "10px" }}
              />
            )}
          </div>

          {qrCodeUrl && (
            <div className="d-flex justify-content-center" style={{ marginBottom: "10px" }}>
              <img src={qrCodeUrl} alt="QR Code" style={{ width: "100px", height: "100px", borderRadius: "5px" }} />
            </div>
          )}

          <div className="d-flex justify-content-between" style={{ marginTop: "10px" }}>
            <button className="btn btn-sm btn-success" onClick={handleDownloadPDF}>Descargar PDF</button>
            <button className="btn btn-sm btn-info" onClick={handlePrint}>Imprimir</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmacion;
