// middlewares/authorizeAdmin.js
export const authorizeAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
  };
  