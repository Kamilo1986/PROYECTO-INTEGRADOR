// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guarda la información del usuario (id y role) en el request
    req.userId = decoded.id;
    req.userRole = decoded.role; // Asegura que el role esté disponible en req.userRole

    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar si el usuario es admin
const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

export { authenticate, authorizeAdmin }; // Exporta ambos middlewares
