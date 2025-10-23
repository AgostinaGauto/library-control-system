// Este archivo utilizara Sequelize para inicializar la conexion, 
// leyendo las variaables del env.

// Importar dependencias
const { Sequelize } = require('sequelize');
// Importar dotenv para cargar variables de entorno
require('dotenv').config();

// Inicializar Sequelize con las variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME,       // Nombre de la DB
  process.env.DB_USER,       // Usuario
  process.env.DB_PASSWORD,   // Contraseña
  {
    host: process.env.DB_HOST,   // Host
    dialect: process.env.DB_DIALECT, // Dialecto (mysql)
    // Opciones adicionales (opcional)
    logging: false, // Desactiva el log de queries SQL en consola
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    // Si la DB no existe, podríamos intentar crearla aquí
  }
}

testConnection();

// Exportar la instancia de Sequelize para usarla en los modelos
module.exports = sequelize;