import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importamos los íconos

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para manejar si se muestra la contraseña
  const navigate = useNavigate();

  const goToRegister = () => navigate("/register");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Verificar si los campos están vacíos
    if (!email || !password) {
      setMessage("Por favor, completa todos los campos.");
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Verificar la solicitud que se envía
      console.log("Datos enviados al servidor:", { email: normalizedEmail, password });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await response.json();

      // Verificar la respuesta en la consola
      console.log("Respuesta del servidor:", data);  // Verifica el contenido de `data`
      
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_id", data.user.id);  // Guardamos el user_id
        localStorage.setItem("hotel_id", data.user.hotel_id);  
        const role = data.user.role?.toLowerCase();

        // Verificar el rol del usuario
        console.log("Rol del usuario:", role);

        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/hotel");
        }
      } else {
        console.log("Error en login:", data.message);
        setMessage(data.message || "Error en el login. Verifica tus credenciales.");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setMessage("Hubo un problema al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        backgroundSize: "cover",
        height: "100vh",
      }}
    >
      <div className="text-center">
        <img
          src={`${process.env.PUBLIC_URL}/logo.png`} // Usa PUBLIC_URL para asegurar que la ruta sea correcta
          alt="Logo de Tu Hotel"
          className="mb-4"
          style={{ width: "150px", height: "auto" }}
        />

        <h2 className="mb-4">
          <span className="text-white">Bienvenido a Tu Hotel</span>
        </h2>

        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"} // Condicional para mostrar/ocultar la contraseña
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="position-absolute top-50 end-0 translate-middle-y me-2 mt-3"
              style={{ background: "transparent", border: "none" }}
              onClick={() => setShowPassword(!showPassword)} // Alternar entre mostrar/ocultar
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}  {/* Icono de ojo */}
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading || !email || !password}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <button
          className="btn btn-link text-white"
          onClick={goToRegister}
        >
          ¿No tienes cuenta? Regístrate
        </button>
        {/* Link de reestablecer contraseña */}
        <div className="text-center mt-3">
            <a href="/reestablecer-contrasena" className="text-decoration-none text-muted">
              <i className="bi bi-shield-lock me-2"></i>¿Olvidaste tu contraseña?
            </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
