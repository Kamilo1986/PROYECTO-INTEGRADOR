import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Función para redirigir al registro
  const goToRegister = () => navigate("/register");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Limpiar cualquier mensaje de error previo

    // Validación básica del formulario
    if (!email || !password) {
      setMessage("Por favor, completa todos los campos.");
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar el token y los datos del usuario en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirigir según el rol del usuario
        const role = data.user.role?.toLowerCase();

        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/hotel"); // Redirigir a la página de hoteles
        }
      } else {
        // Mostrar el mensaje de error recibido del backend
        setMessage(data.message || "Error en el login. Verifica tus credenciales.");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setMessage("Hubo un problema al iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false); // Detener el loading una vez que la petición haya terminado
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
      <div className="col-md-4 p-5 bg-white shadow-lg rounded text-center">
        <img
          src="/logo.png"
          alt="Logo de Tu Hotel"
          className="mb-4"
          style={{ width: "150px", height: "auto" }}
        />
        <h2 className="mb-4">
          Bienvenido a <span className="text-primary">Tu Hotel</span>
        </h2>

        {message && <div className="alert alert-danger">{message}</div>} {/* Mostrar mensajes de error */}

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
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading || !email || !password} // Deshabilitar el botón si ya está cargando o si falta algún campo
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Enlace para redirigir al registro */}
        <button
          className="btn btn-link text-primary"
          onClick={goToRegister}
        >
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </div>
  );
};

export default Login;
