import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Register = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessages, setErrorMessages] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    global: '', // Mensaje global de error
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Reset error message for the field being edited
    setErrorMessages((prevMessages) => ({
      ...prevMessages,
      [name]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = userData;

    // Validaciones del formulario
    let newErrorMessages = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      global: '',
    };

    let hasError = false;

    if (!name) {
      newErrorMessages.name = 'El nombre es obligatorio';
      hasError = true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      newErrorMessages.email = 'El correo electrónico no es válido';
      hasError = true;
    }

    if (!password) {
      newErrorMessages.password = 'La contraseña es obligatoria';
      hasError = true;
    } else if (password.length < 6) {
      newErrorMessages.password = 'La contraseña debe tener al menos 6 caracteres';
      hasError = true;
    } else if (!/\d/.test(password)) {
      newErrorMessages.password = 'La contraseña debe contener al menos un número';
      hasError = true;
    } else if (!/[A-Z]/.test(password)) {
      newErrorMessages.password = 'La contraseña debe contener al menos una letra mayúscula';
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrorMessages.confirmPassword = 'Las contraseñas no coinciden';
      hasError = true;
    }

    setErrorMessages(newErrorMessages);

    if (hasError) return; // Si hay errores, no continuar

    setIsSubmitting(true);

    try {
      // Hacer la solicitud POST al backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      setIsSubmitting(false);

      if (response.ok) {
        setSuccessMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setUserData({ name: '', email: '', password: '', confirmPassword: '' }); // Limpiar los campos

        // Redirigir a la página de login después de un pequeño retraso
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Mostrar errores del backend
        setErrorMessages({ global: data.message || 'Error al registrar el usuario' });
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error en el registro:', error);
      setErrorMessages({ global: 'Error al registrar el usuario' });
    }
  };

  return (
    <Container className="register-container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={6} className="mx-auto">
          <div className="text-center mb-4">
            <img src="logo.png" alt="Logo" className="logo" />
            <h1>Crear Cuenta</h1>
          </div>
          <Form onSubmit={handleSubmit} className="form-container">
            <Form.Group controlId="name">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                placeholder="Ingrese su nombre"
                isInvalid={!!errorMessages.name}
                disabled={isSubmitting}
              />
              {errorMessages.name && <Form.Text className="text-danger">{errorMessages.name}</Form.Text>}
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="Ingrese su correo electrónico"
                isInvalid={!!errorMessages.email}
                disabled={isSubmitting}
              />
              {errorMessages.email && <Form.Text className="text-danger">{errorMessages.email}</Form.Text>}
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                placeholder="Ingrese su contraseña"
                isInvalid={!!errorMessages.password}
                disabled={isSubmitting}
              />
              {errorMessages.password && <Form.Text className="text-danger">{errorMessages.password}</Form.Text>}
            </Form.Group>

            <Form.Group controlId="confirmPassword">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirme su contraseña"
                isInvalid={!!errorMessages.confirmPassword}
                disabled={isSubmitting}
              />
              {errorMessages.confirmPassword && <Form.Text className="text-danger">{errorMessages.confirmPassword}</Form.Text>}
            </Form.Group>

            {errorMessages.global && <div className="text-danger mt-2">{errorMessages.global}</div>}
            {successMessage && <div className="text-success mt-2">{successMessage}</div>}

            <Button variant="primary" type="submit" className="mt-3 w-100" disabled={isSubmitting}>
              {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Crear Cuenta'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
