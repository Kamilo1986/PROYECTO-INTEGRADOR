import React, { useState, useEffect } from "react"; // Add useState and useEffect imports
import { useNavigate } from "react-router-dom"; // Add useNavigate import

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Spinner } from 'react-bootstrap'; // Add Spinner import
const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [filters, setFilters] = useState({ price: "", name: "", rating: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const ratings = [4.1, 4.2, 4.3, 4.4, 4.5];

    const fetchHotels = async () => {
      try {
        const response = await fetch(`https://proyecto-integrador-1-oytp.onrender.com /api/hotels`);
        const data = await response.json();

        const updatedHotels = data.map((hotel, index) => ({
          ...hotel,
          rating: ratings[index % ratings.length],
        }));

        setHotels(updatedHotels);
        setFilteredHotels(updatedHotels);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [name]: value,
      };
      applyFilters(newFilters);
      return newFilters;
    });
  };

  const applyFilters = (newFilters) => {
    let filtered = [...hotels];
    
    if (newFilters.name) {
      filtered = filtered.filter((hotel) =>
        hotel.name.toLowerCase().includes(newFilters.name.toLowerCase())
      );
    }

    if (newFilters.price) {
      const selectedPrice = parseFloat(newFilters.price);
      filtered = filtered.filter((hotel) => parseFloat(hotel.price_per_night) === selectedPrice);
    }

    if (newFilters.rating) {
      const selectedRating = parseFloat(newFilters.rating);
      filtered = filtered.filter((hotel) => parseFloat(hotel.rating) === selectedRating);
    }

    setFilteredHotels(filtered);
  };

  const handleResetFilters = () => {
    setFilters({ price: "", name: "", rating: "" });
    setFilteredHotels(hotels);
  };

  const handleReserve = (hotelId) => {
    navigate("/reservar", { state: { hotelId } });
  };

  const handleBack = () => {
    setFilters({ price: "", name: "", rating: "" });
    setFilteredHotels(hotels);
    navigate("/hotel");
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < rating ? "★" : "☆");
    }
    return stars.join(" ");
  };

  const uniquePrices = [...new Set(hotels.map(hotel => parseFloat(hotel.price_per_night).toFixed(2)))];
  const uniqueHotelNames = [...new Set(hotels.map(hotel => hotel.name))];

  return (
    <>
      {/* Fondo en toda la pantalla */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(to right, #6a11cb, #2575fc)",
          zIndex: -1,
        }}
      />
  
      {/* Contenido principal */}
      <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">  
        <div className="col-md-8 bg-white p-4 shadow rounded">
          <h2 className="text-center text-primary mb-4">Hoteles Disponibles</h2>
  
          {/* Filtros */}
          <div className="row mb-3">
            <div className="col-md-3">
              <select className="form-control" name="name" value={filters.name} onChange={handleFilterChange}>
                <option value="">Nombre del hotel</option>
                {uniqueHotelNames.map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-control" name="price" value={filters.price} onChange={handleFilterChange}>
                <option value="">Precio</option>
                {uniquePrices.map((price) => (
                  <option key={price} value={price}>${price}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-control" name="rating" value={filters.rating} onChange={handleFilterChange}>
                <option value="">Calificación</option>
                {[4.1, 4.2, 4.3, 4.4, 4.5].map((rating) => (
                  <option key={rating} value={rating}>{rating} ★</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 text-center">
              <button className="btn btn-outline-secondary w-100" onClick={handleResetFilters}>
                Limpiar Filtros
              </button>
            </div>
          </div>
  
          {/* Spinner de carga */}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="row mb-3">
              {filteredHotels.length === 0 && (
                <div className="col-12 text-center">
                  <p>No se encontraron hoteles que coincidan con los filtros.</p>
                </div>
              )}
              {filteredHotels.map((hotel) => (
                <div className="col-md-4 mb-4" key={hotel.id}>
                  <div className="card h-100 shadow-sm" style={{ maxWidth: "300px", margin: "0 auto", display: "flex", flexDirection: "column" }}>
                    <img src={`${process.env.PUBLIC_URL}/images/${hotel.image}`} alt={hotel.name} className="card-img-top" style={{ height: "150px", objectFit: "cover", borderRadius: "8px" }} />
                    <div className="card-body" style={{ padding: "15px", flexGrow: 1 }}>
                      <h5 className="card-title" style={{ fontSize: "18px", fontWeight: "bold" }}>{hotel.name}</h5>
                      <p className="card-text" style={{ fontSize: "14px" }}>
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        {hotel.location}
                      </p>
                      <p className="card-text" style={{ fontSize: "14px" }}>
                        <i className="bi bi-cash-stack me-2"></i>
                        Precio por noche: ${parseFloat(hotel.price_per_night).toFixed(2)}
                      </p>
                      <p className="card-text" style={{ fontSize: "14px" }}>
                        <i className="bi bi-star-fill me-2"></i>
                        {renderStars(hotel.rating)} ({hotel.rating.toFixed(1)})
                      </p>
                      <p className="card-text" style={{ fontSize: "14px" }}>
                        {hotel.description}
                      </p>
                    </div>
                    <button className="btn btn-primary w-100" style={{ fontSize: "14px", padding: "8px 0" }} onClick={() => handleReserve(hotel.id)}>
                      Reservar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
  
          {/* Botón Volver */}
          <div className="text-center mt-4">
            <button className="btn btn-outline-primary" onClick={handleBack}>
              <i className="bi bi-arrow-left-circle me-2"></i> Volver
            </button>
          </div>
        </div>
      </div>
    </>
  );
};      

export default Hotels;  