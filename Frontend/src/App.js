import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Hotels from "./components/hotel";
import Booking from "./components/Booking";
import Confirmacion from "./components/Confirmacion";
import AdminDashboard from "./components/Admin";
import PrivateRoute from "./components/PrivateRoute";
import Reservations from "./components/Reservations"; // Lista de reservas

import Navbar from "./components/Navbar"; // Navbar aquí solo una vez
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col justify-center items-center">
      {/* Condicionalmente renderizar el Navbar, evitando que se muestre en Login o Register */}
      {window.location.pathname !== "/login" && window.location.pathname !== "/register" && <Navbar />}

      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/hotel" element={<Hotels />} />

        {/* Rutas protegidas para usuarios */}
        <Route
          path="/reservas"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <Reservations />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservar"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <Booking />
            </PrivateRoute>
          }
        />
        <Route
          path="/confirmacion"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <Confirmacion />
            </PrivateRoute>
          }
        />

        {/* Rutas protegidas para administradores */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Ruta comodín */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
