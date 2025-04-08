import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login"); // Redirigir a la página de login
    }
  };

  return (
    <button
      className="btn btn-outline-light btn-sm"
      style={{
        borderRadius: "20px",
        padding: "5px 15px",
        fontWeight: "bold",
        fontSize: "14px",
      }}
      onClick={handleLogout}
    >
      <i className="bi bi-box-arrow-right"></i> Cerrar Sesión
    </button>
  );
};

export default LogoutButton;
