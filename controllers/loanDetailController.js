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
      where: { id_prestamo: id },
      include: [
        {
          model: Libro,
          as: 'libroPrestamo',  // Alias definido en associations
          attributes: ['id_libro', 'titulo', 'autor', 'editorial', 'estado']
        }
      ]
    });

    // Mapear los detalles para la vista y renombrar alias
    const detallesFormateados = detalles.map(d => {
      const detalle = d.get({ plain: true });
      return {
        ...detalle,
        libro: detalle.libroPrestamo || {}  // alias accesible en la vista
      };
    });

    // DEBUG: imprime los detalles en consola para verificar datos
    console.log('Detalles formateados del préstamo:', JSON.stringify(detallesFormateados, null, 2));

    // Renderizar la vista con los datos
    res.render('loans/loanDetail', {
      prestamo: prestamo.get({ plain: true }),
      detalles: detallesFormateados
    });
  } catch (error) {
    console.error('Error al obtener detalle del préstamo:', error);
    res.status(500).send('Error al obtener los detalles del préstamo');
  }
};

module.exports = loanDetailController;

