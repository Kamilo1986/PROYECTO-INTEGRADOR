import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión a la base de datos
const db = mysql.createPool({
    host: process.env.DB_HOST,  // Por ejemplo, 'localhost' o el host del servicio de base de datos
    user: process.env.DB_USER,  // El nombre de usuario para la base de datos
    password: process.env.DB_PASSWORD,  // La contraseña de la base de datos
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,  // El nombre de la base de datos a la que te conectas
    waitForConnections: true,  // Permite que las conexiones se pongan en espera si el pool está lleno
    connectionLimit: 5,  // Limita la cantidad de conexiones simultáneas en el pool
    queueLimit: 0,
    connectTimeout: 10000
    // Sin límite para la cola de conexiones, ajusta según sea necesario
});

// Verificar la conexión a la base de datos al iniciar la aplicación
async function checkDbConnection() {
    try {
        const connection = await db.getConnection();  // Obtener una conexión del pool
        console.log("✅ Conexión exitosa a la base de datos:", process.env.DB_NAME);
        connection.release();  // Liberar la conexión al pool
    } catch (err) {
        console.error("❌ Error de conexión:", err.message);
        process.exit(1);  // Detener la aplicación si no se puede conectar
    }
}

// Llamar a la función para verificar la conexión al iniciar el servidor
checkDbConnection();

export default db;
