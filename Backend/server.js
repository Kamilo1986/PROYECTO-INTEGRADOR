// En server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotels.js';
import roomsRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservation.js'; // Cambiar la importación
import adminRoutes from './routes/adminRoutes.js';
import db from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar variables de entorno críticas
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME || !process.env.FRONTEND_URL) {
  console.error('❌ Falta alguna variable de entorno necesaria. Revisa tu archivo .env');
  process.exit(1);
}

// ⚙️ Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL, // e.g. http://localhost:3000
  credentials: true,                // necesario para cookies o tokens en headers
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Seguridad y middlewares
app.use(helmet());
app.disable('x-powered-by');  // Mejorar seguridad deshabilitando la cabecera `X-Powered-By`
app.use(express.json());

// Servir archivos estáticos desde /images
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ✅ Servir archivos estáticos desde /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Verificar conexión a la BD
const checkDbConnection = async () => {
  try {
    await db.getConnection();
    console.log("✅ Conectado a la base de datos");
  } catch (err) {
    console.error("❌ Error de conexión a MySQL:", err);
    process.exit(1);  // Detener el servidor si no se puede conectar a la base de datos
  }
};

checkDbConnection();

// 📦 Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/reservations', reservationRoutes);  // Usar la exportación por defecto
app.use('/api/admin', adminRoutes);

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
