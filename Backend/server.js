import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotels.js';
import roomsRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservation.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/email.js';
import db from './config/db.js';

dotenv.config(); // Cargar variables de entorno

const app = express();

// Obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ Validación de variables de entorno necesarias
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'FRONTEND_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Falta la variable de entorno: ${key}`);
    process.exit(1);
  }
}

// Configuración de CORS con múltiples orígenes permitidos
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir sin origen (como en Postman) o si está en la lista de permitidos
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // Devolver el mismo origen que hace la solicitud
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Seguridad y middlewares globales
app.use(helmet());
app.disable('x-powered-by');
app.use(express.json());

// Archivos estáticos
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para errores globales
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// Verificar conexión con la BD
const checkDbConnection = async () => {
  try {
    await db.getConnection();
    console.log("✅ Conectado a la base de datos");
  } catch (err) {
    console.error("❌ Error al conectar con MySQL:", err);
    process.exit(1);
  }
};
checkDbConnection();

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
