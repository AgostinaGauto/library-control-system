const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Libro = require('./bookModel'); // Importamos modelo de Libro

const Repair = sequelize.define('Reparacion', {
  id_reparacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_ingreso: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: { msg: 'La fecha de ingreso debe ser válida.' },
      notNull: { msg: 'La fecha de ingreso es obligatoria.' }
    }
  },
  fecha_egreso: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: { msg: 'La fecha de egreso debe ser válida.' }
    }
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El motivo de la reparación es obligatorio.' }
    }
  },
  cod_libro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Libro,
      key: 'id_libro'
    }
  }
}, {
  tableName: 'Reparacion',
  timestamps: false
});

// Relación: una reparación pertenece a un libro
Repair.belongsTo(Libro, { foreignKey: 'cod_libro', as: 'libro' });

//  Hook: al crear una reparación, el libro pasa a "en reparacion"
Repair.afterCreate(async (reparacion) => {
  const libro = await Libro.findByPk(reparacion.cod_libro);
  if (libro) {
    await libro.update({ estado: 'en reparacion' });
  }
});

//  Hook: al eliminar una reparación, el libro vuelve a "en biblioteca"
Repair.afterDestroy(async (reparacion) => {
  const libro = await Libro.findByPk(reparacion.cod_libro);
  if (libro) {
    await libro.update({ estado: 'en biblioteca' });
  }
});

module.exports = Repair;


