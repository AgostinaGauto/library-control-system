// Este archivo define la estructura de la tabla Usuario en la base de datos
// utilizando Sequelize

const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // La instancia de conexión que creamos

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id' // Nombre de la columna en la DB según el diagrama
  },
  user: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'user' // Nombre de la columna
  },
  password: {
    type: DataTypes.STRING(255), // Un VARCHAR largo para la contraseña encriptada (bcrypt)
    allowNull: false,
    field: 'password' // Nombre de la columna
  }
}, {
  tableName: 'Usuario', // Asegura el nombre de la tabla
  timestamps: false     // No necesitamos las columnas createdAt y updatedAt
});

// Sincronizar (crear la tabla si no existe).
// **¡Importante!** Solo la primera vez, o si no tenés un sistema de migraciones.
// En producción, se recomienda usar migraciones.
Usuario.sync({ force: false }); 

module.exports = Usuario;