const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Se asume esta ruta corregida

const Libro = sequelize.define('Libro', {
    id_libro: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false, // Ahora es OBLIGATORIO
        validate: {
            notEmpty: {
                msg: 'El título del libro es obligatorio.'
            },
            //len: {
            //args: [2, 255],
            // msg: 'El título debe tener entre 2 y 255 caracteres.'
            // }
        }
    },

    autor: {
        type: DataTypes.STRING,     // Guarda texto (nombre del autor)
        allowNull: false,           // Impide que sea NULL en la base de datos
        validate: {
            notNull: {
                msg: 'El autor no puede ser nulo.' // Si se intenta guardar sin campo alguno
            },
            notEmpty: {
                msg: 'El autor no puede estar vacío.' // Si llega una cadena vacía: ''
            },
        
            is: {
                args: /^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s'.-]+$/i, // Solo letras, espacios y caracteres comunes de nombres
                msg: 'El nombre del autor solo puede contener letras y espacios.'
            }
        }
    },



    editorial: {
        type: DataTypes.STRING(100),
        allowNull: false, // Ahora es OBLIGATORIO
        validate: {
            notEmpty: {
                msg: 'La editorial es un campo obligatorio.'
            },
            //len: {
            //args: [2, 100],
            //msg: 'La editorial debe tener entre 2 y 100 caracteres.'
            // }
        }
    },
    fecha_edicion: {
        type: DataTypes.DATEONLY,
        allowNull: false, // Ahora es OBLIGATORIO
        validate: {
            isDate: {
                msg: 'La fecha de edición debe ser una fecha válida (YYYY-MM-DD).'
            },
            notNull: { // Complementa allowNull: false
                msg: 'La fecha de edición es obligatoria.'
            }
        }
    },
    idioma: {
        type: DataTypes.STRING(50),
        allowNull: false, // Ahora es OBLIGATORIO
        validate: {
            notEmpty: {
                msg: 'El idioma es obligatorio.'
            },
            //len: {
            // args: [2, 50],
            // msg: 'El idioma debe tener entre 2 y 50 caracteres.'
            // }
        }
    },
    cantPaginas: {
        type: DataTypes.INTEGER,
        allowNull: false, // Ahora es OBLIGATORIO
        validate: {
            isInt: {
                msg: 'La cantidad de páginas debe ser un número entero.'
            },
            min: {
                args: [1],
                msg: 'La cantidad de páginas debe ser al menos 1.'
            },
            notNull: { // Complementa allowNull: false
                msg: 'La cantidad de páginas es obligatoria.'
            }
        }
    },
    estado: {
        type: DataTypes.ENUM('en biblioteca', 'prestado', 'en reparación'),
        defaultValue: 'en biblioteca',
        allowNull: false, // Siempre OBLIGATORIO
        validate: {
            isIn: {
                args: [['en biblioteca', 'prestado', 'en reparación']],
                msg: 'El estado debe ser "en biblioteca", "prestado" o "en reparación".'
            }
        }
    }
}, {
    tableName: 'Libro',
    timestamps: false
});

module.exports = Libro;