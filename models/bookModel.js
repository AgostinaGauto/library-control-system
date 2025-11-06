const { DataTypes } = require('sequelize')
const sequelize = require('../database/connection');

// Nombre del modelo: 'Libro' (Mayúscula)
const Libro = sequelize.define('Libro', { 
    id_libro: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        
    },
    // ... (resto de campos) ...
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    // ... (resto de campos) ...
    estado: {
        type: DataTypes.ENUM('en biblioteca', 'prestado', 'en reparacion'),
        allowNull: false,
        defaultValue: 'en biblioteca',
    }, 
}, {
    // CORRECCIÓN CLAVE: Forzamos el nombre de la tabla a minúscula
    tableName: 'libro', 
    timestamps: false
    
});

module.exports = Libro;