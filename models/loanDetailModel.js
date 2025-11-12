const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const DetallePrestamo = sequelize.define('DetallePrestamo', {
    id_detalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_prestamo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_libro: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    observaciones: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'DetallePrestamo',
    timestamps: false
});

module.exports = DetallePrestamo;
