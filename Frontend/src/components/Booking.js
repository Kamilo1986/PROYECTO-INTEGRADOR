import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Booking = () => {
  const [rooms, setRooms] = useState([]);
  const [formDataByRoom, setFormDataByRoom] = useState({});
  const [alertByRoom, setAlertByRoom] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("Token no encontrado. No se redirige a login.");
          return; // Si no hay token, no hacemos nada
        }

        const response = await fetch("https://proyecto-integrador-1-oytp.onrender.com /api/rooms/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data.rooms)) {
          const validRooms = data.rooms.filter((room) => room !== null);
          setRooms(validRooms);

          const initialFormData = {};
          const initialAlerts = {};

          validRooms.forEach((room) => {
            initialFormData[room.id] = {
              guest_name: "",
              guest_phone: "",
              check_in_date: "",
              check_out_date: "",
              nights: 0,
              total_price: 0,
              price: room.price,
              hotel_id: room.hotel_id,
              image: room.image || null,
            };
            initialAlerts[room.id] = { show: false, type: "", message: "" };
          });

          setFormDataByRoom(initialFormData);
          setAlertByRoom(initialAlerts);
        } else {
          console.error("Error al obtener habitaciones:", data.message);
        }
      } catch (error) {
        console.error("Error al obtener habitaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [navigate]);

  const showAlert = (roomId, type, message) => {
    console.log(`showAlert - Room ID: ${roomId}, Type: ${type}, Message: ${message}`);
    setAlertByRoom((prev) => ({
      ...prev,
      [roomId]: { show: true, type, message },
    }));
    setTimeout(() => {
      setAlertByRoom((prev) => ({
        ...prev,
        [roomId]: { show: false, type: "", message: "" },
      }));
    }, 3500);
  };

  const handleInputChange = (roomId, field, value) => {
    console.log(`handleInputChange - Room ID: ${roomId}, Field: ${field}, Value: ${value}`);
    setFormDataByRoom((prev) => {
      const prevData = prev[roomId] || {};
      const updatedData = { ...prevData, [field]: value };

      if (field === "check_in_date" || field === "check_out_date") {
        const checkInDate = new Date(updatedData.check_in_date + "T00:00:00");
        const checkOutDate = new Date(updatedData.check_out_date + "T00:00:00");

        if (checkOutDate > checkInDate) {
          const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24));
          const total = nights * Number(updatedData.price || 0);
          updatedData.nights = nights;
          updatedData.total_price = total;
        } else {
          updatedData.nights = 0;
          updatedData.total_price = 0;
        }
      }

      return { ...prev, [roomId]: updatedData };
    });
  };

  const handleBooking = async (roomId) => {
    const formData = formDataByRoom[roomId];
    console.log("handleBooking - Form data:", formData);

    // Validaciones
    if (!formData.guest_name) {
      showAlert(roomId, "warning", "El nombre del huésped es obligatorio.");
      return;
    }

    if (!formData.guest_phone) {
      showAlert(roomId, "warning", "El número telefónico es obligatorio.");
      return;
    }
    if (!/^\d{10}$/.test(formData.guest_phone)) {
      showAlert(roomId, "warning", "El número telefónico debe contener exactamente 10 dígitos.");
      return;
    }

    if (!formData.check_in_date || !formData.check_out_date) {
      showAlert(roomId, "warning", "Las fechas de entrada y salida son obligatorias.");
      return;
    }

    if (formData.total_price <= 0) {
      showAlert(roomId, "warning", "Las fechas o el total son inválidos.");
      return;
    }

    const datosReserva = {
      
      room_id: roomId,
      hotel_id: formData.hotel_id,
      guest_name: formData.guest_name,
      guest_phone: formData.guest_phone,
      check_in_date: formData.check_in_date,
      check_out_date: formData.check_out_date,
      total_price: parseFloat(formData.total_price),
      user_id: localStorage.getItem("user_id"),
      image: formData.image || null,
      status: "pending",
   
    };

    console.log("handleBooking - Datos de la reserva a enviar:", datosReserva);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("https://proyecto-integrador-1-oytp.onrender.com /api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosReserva),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Reserva exitosa:", result);
        showAlert(roomId, "success", "Reserva completada con éxito.");
        setTimeout(() => {
          // Aquí ya no necesitamos acceder a result[0], simplemente pasamos el objeto result
          console.log("Datos de la reserva antes de navegar:", result);
          navigate("/confirmacion", { state: { booking: result } });
          localStorage.setItem("booking", JSON.stringify(result));
        }, 2000);
      } else {
        showAlert(roomId, "danger", result.message || "Error al reservar.");
      }
    } catch (error) {
      console.error("Error al realizar la reserva:", error);
      showAlert(roomId, "danger", "Ocurrió un error al realizar la reserva.");
    }
  };
  return (
  
    <div
      className="container-fluid py-5"
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh", 
        width: "100%", 
      }}
    >
      <h2 className="text-center mb-4 text-white">Reservar habitación</h2>
  
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Cargando habitaciones...</p>
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-center text-danger fs-5">No hay habitaciones disponibles.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {rooms.map((room) => {
            const formData = formDataByRoom[room.id] || {};
            const alert = alertByRoom[room.id] || {};
            const { guest_name, guest_phone, check_in_date, check_out_date, nights = 0, total_price = 0 } = formData;
  
            return (
              <div key={room.id} className="col d-flex justify-content-center">
                <div
                  className="card shadow-sm h-100 border-0 rounded-4 d-flex flex-column"
                  style={{ width: '100%', maxWidth: '400px', minHeight: '100%', display: 'flex' }}
                >
                  <img
                    src={room.image ? `${process.env.PUBLIC_URL}/images/${room.image}` : "/images/default.jpg"}
                    alt={room.room_type || "Habitación"}
                    className="card-img-top rounded-top-4"
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column" style={{ flex: '1' }}>
                    <h5 className="card-title text-primary fw-bold">{room.room_type || "Tipo no definido"}</h5>
                    <p className="card-text text-muted" style={{ fontSize: '0.9rem' }}>
                      {room.description || "Sin descripción"}
                    </p>
                    <span className="badge bg-success mb-2 fs-6">
                      <i className="bi bi-cash-coin me-1"></i>
                      {room.price.toLocaleString("es-MX", { style: "currency", currency: "MXN" })} por noche
                    </span>
            
                    {alert.show && (
                      <div className={`alert alert-${alert.type} d-flex align-items-center`} role="alert">
                        <i className={`bi bi-exclamation-circle-fill me-2`}></i>
                        {alert.message}
                      </div>
                    )}
            
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      placeholder="Nombre del huésped"
                      value={guest_name}
                      onChange={(e) => handleInputChange(room.id, "guest_name", e.target.value)}
                    />
            
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      placeholder="Número telefónico"
                      value={guest_phone}
                      onChange={(e) => handleInputChange(room.id, "guest_phone", e.target.value)}
                    />
            
                    <div className="mb-2">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={check_in_date}
                        onChange={(e) => handleInputChange(room.id, "check_in_date", e.target.value)}
                      />
                    </div>
            
                    <div className="mb-2">
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={check_out_date}
                        onChange={(e) => handleInputChange(room.id, "check_out_date", e.target.value)}
                      />
                    </div>
            
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-muted">
                        Noches: <span className="fw-bold">{nights}</span>
                      </small>
                      <small className="text-muted">
                        Total: <span className="fw-bold">{total_price.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</span>
                      </small>
                    </div>
            
                    <button
                      className="btn btn-primary btn-sm mt-auto"
                      onClick={() => handleBooking(room.id)}
                    >
                      Confirmar reserva
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>  
      )}    
    </div>
  );  
};

export default Booking;            