const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

const Socio = sequelize.define('Socio', {
    id_socio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nomyape: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre y apellido del socio es obligatorio.'
            }
        }
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: {
                msg: 'La fecha de nacimiento debe ser válida (YYYY-MM-DD).'
            },
            notNull: {
                msg: 'La fecha de nacimiento es obligatoria.'
            },
            isBefore: {
                args: new Date().toISOString().split('T')[0],
                msg: 'La fecha de nacimiento no puede ser posterior al día de hoy.'
            }
        }
    },
    telefono: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El teléfono es obligatorio.'
            },
            len: {
                args: [7, 50],
                msg: 'El teléfono debe tener entre 7 y 50 caracteres.'
            }
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
            msg: 'Este email ya está registrado.'
        },
        validate: {
            isEmail: {
                msg: 'Debe ingresar un email válido.'
            },
            notEmpty: {
                msg: 'El email es obligatorio.'
            }
        }
    }
}, {
    tableName: 'Socio',
    timestamps: false
});

module.exports = Socio;
