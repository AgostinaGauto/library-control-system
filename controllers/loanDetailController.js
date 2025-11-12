////////////////////// ARCHIVO NUEVO ////////////////////////

const Prestamo = require('../models/loanModel');
const DetallePrestamo = require('../models/loanDetailModel');
const Libro = require('../models/bookModel');
const Socio = require('../models/memberModel');

const loanDetailController = {};

// 📘 Ver detalle de un préstamo
loanDetailController.loanDetail = async (req, res) => {
  try {
    const id = req.params.id;

    // Buscar el préstamo principal con su socio
    const prestamo = await Prestamo.findByPk(id, {
      include: [{ model: Socio, as: 'socio' }]
    });

    if (!prestamo) {
      return res.status(404).send('Préstamo no encontrado');
    }

    // Buscar los libros asociados (detalle del préstamo)
    const detalles = await DetallePrestamo.findAll({
      where: { id_prestamo: id }, // ✅ corregido nombre de la FK
      include: [{ model: Libro, as: 'Libro' }]
    });

    // Renderizar la vista con los datos
    res.render('loans/loanDetail', { prestamo: prestamo.get({ plain: true }), detalles: detalles.map(d => d.get({ plain: true })) });
  } catch (error) {
    console.error('Error al obtener detalle del préstamo:', error);
    res.status(500).send('Error al obtener los detalles del préstamo');
  }
};

module.exports = loanDetailController;