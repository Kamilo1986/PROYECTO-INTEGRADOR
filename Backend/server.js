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
import misReservasRoutes from './routes/misReservas.js'; // ✅ NUEVA LÍNEA
import db from './config/db.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'FRONTEND_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Falta la variable de entorno: ${key}`);
    process.exit(1);
  }
}

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://proyecto-integrador-3-aa6i.onrender.com',
  process.env.FRONTEND_URL, 
  'http://192.168.1.8:3000'  // Verifica que esta URL sea correcta
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet());
app.disable('x-powered-by');
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api', misReservasRoutes); // ✅ NUEVA RUTA

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
});

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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
