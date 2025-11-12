const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Prestamo = sequelize.define('Prestamo', {
    id_prestamo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    id_socio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'El ID del socio es obligatorio para un préstamo.'
            }
        }
    },

    fecha_prestamo: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
            isDate: {
                msg: 'La fecha de préstamo debe ser una fecha válida.'
            },
            notNull: {
                msg: 'La fecha de préstamo es obligatoria.'
            }
        }
    },

    fecha_devolucion: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: {
                msg: 'La fecha de devolución debe ser una fecha válida.'
            }
        }
    },

    estado_prestamo: {
        type: DataTypes.ENUM('vigente', 'devuelto', 'parcial'),
        defaultValue: 'vigente',
        allowNull: false
    }
}, {
    tableName: 'Prestamo',
    timestamps: false
});

module.exports = Prestamo;
