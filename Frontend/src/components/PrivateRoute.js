import React from "react";
import { Navigate } from "react-router-dom";

const isTokenExpired = () => {
  const token = localStorage.getItem("token");
  if (!token) return true;

  try {
    const { exp } = JSON.parse(atob(token.split('.')[1])); // Decodificar el token
    const expirationDate = new Date(exp * 1000); // Expira en formato timestamp
    return expirationDate < new Date();
  } catch (e) {
    console.error("Error al decodificar el token:", e);
    return true; // Si ocurre un error, considerar el token como expirado
  }
};

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    console.error("Error al parsear el usuario desde localStorage", e);
  }

  // Si no hay token, el token está expirado, o no se pudo obtener el usuario, redirigir al login
  if (!token || !user || !user.role || isTokenExpired()) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el rol del usuario está dentro de los permitidos
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirigir a una página de acceso denegado
    return <Navigate to="/access-denied" replace />;
  }

  // Si pasa todas las validaciones, mostrar el contenido protegido
  return children;
};

export default PrivateRoute;
