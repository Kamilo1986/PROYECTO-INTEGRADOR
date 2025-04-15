import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  const [weather, setWeather] = useState(null);
  const [dollarRate, setDollarRate] = useState(null);
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const weatherAPIUrl = "https://api.openweathermap.org/data/2.5/weather?q=New%20York&appid=58ddef881a6f75c780ff7b9ad3d47dc2&units=metric";
  const exchangeAPIUrl = "https://v6.exchangerate-api.com/v6/081e4cba9282d00407ec5335/latest/USD";
  const newsAPIUrl = "https://newsapi.org/v2/top-headlines?country=us&apiKey=89c4c3a9e7d44992988dd190d2ab442d";

  const isAuthenticated = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherResponse, exchangeResponse, newsResponse] = await Promise.all([
          fetch(weatherAPIUrl),
          fetch(exchangeAPIUrl),
          fetch(newsAPIUrl),
        ]);

        const weatherData = await weatherResponse.json();
        const exchangeData = await exchangeResponse.json();
        const newsData = await newsResponse.json();

        if (weatherData.main && weatherData.weather) {
          setWeather(weatherData);
        } else {
          setError("No se pudo obtener la información del clima.");
        }

        if (exchangeData.conversion_rates?.EUR) {
          setDollarRate(exchangeData.conversion_rates.EUR);
        } else {
          setError("No se pudo obtener la tasa de cambio.");
        }

        if (newsData.articles?.length > 0) {
          setNews(newsData.articles);
        } else {
          setError("No se pudo obtener las noticias.");
        }
      } catch (err) {
        setError("Hubo un problema al cargar las APIs.");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid">
          <span
            className="navbar-brand"
            style={{ cursor: "pointer", fontWeight: "bold", fontSize: "24px" }}
            onClick={() => navigate("/")}
          >
            <img
              src="./logo.png"
              alt="Tu Hotel"
              style={{ width: "50px", marginRight: "10px", borderRadius: "50%" }}
            />
            Tu Hotel
          </span>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {isAuthenticated && (
                <li className="nav-item">
                  <Link className="nav-link" to="/reservas">Mis Reservas</Link>
                </li>
              )}
              <li className="nav-item">
                <button
                  className="btn btn-outline-light rounded-pill"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div
        className="d-flex justify-content-center align-items-center text-white"
        style={{
          backgroundImage: "url('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDc0cWVjOHM1MDQzYnE2YTg4aW1lZHJoYmEyMTdxODJsanQ0dnFiMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7AtHoQ9XWbpwLRxs0t/giphy.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "120px",
          color: "white",
          textShadow: "2px 2px 5px rgba(0, 0, 0, 0.7)",
          overflow: "hidden",
          position: "relative",
          fontSize: "20px",
          padding: "10px 20px",
        }}
      >
        <div style={{ whiteSpace: "nowrap", animation: "scrollText 30s linear infinite" }}>
          {weather ? (
            <span>Clima: {weather.weather[0].description}, {weather.main.temp}°C | </span>
          ) : (
            <span>{error || "Cargando clima..."} | </span>
          )}
          {dollarRate !== null ? (
            <span>1 USD = {dollarRate} EUR | </span>
          ) : (
            <span>{error || "Cargando tasa de cambio..."} | </span>
          )}
          {news.length > 0 ? (
            <span>Última noticia: {news[0].title}</span>
          ) : (
            <span>{error || "Cargando noticias..."}</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scrollText {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
