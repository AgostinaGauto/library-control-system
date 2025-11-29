const Repair = require('../models/repairModel');
const Libro = require('../models/bookModel');

const repairController = {};

/**
 * 📋 Listar todas las reparaciones
 */
repairController.list = async (req, res) => {
  try {
    const reparaciones = await Repair.findAll({
      include: [{ model: Libro, as: 'libro', attributes: ['titulo', 'estado'] }],
      order: [['fecha_ingreso', 'DESC']]
    });

    const lista = reparaciones.map(r => r.get({ plain: true }));

    res.render('repairs/list', { reparaciones: lista });
  } catch (error) {
    console.error('Error al listar las reparaciones:', error);
    res.status(500).send('Error al obtener las reparaciones.');
  }
};

/**
 * ➕ Mostrar formulario para crear una nueva reparación
 */
repairController.formAdd = async (req, res) => {
  try {
    const librosDisponibles = await Libro.findAll({
      where: { estado: 'en biblioteca' },
      order: [['titulo', 'ASC']]
    });

    const libros = librosDisponibles.map(libro => libro.get({ plain: true }));

    res.render('repairs/add', { libros });
  } catch (error) {
    console.error('Error al cargar formulario de reparación:', error);
    res.status(500).send('Error al cargar el formulario.');
  }
};

/**
 * 💾 Crear una nueva reparación
 */
repairController.add = async (req, res) => {
  try {
    const { fecha_ingreso, motivo, cod_libro } = req.body;

    const libro = await Libro.findByPk(cod_libro);
    if (!libro) return res.status(400).send('El libro seleccionado no existe.');
    if (libro.estado !== 'en biblioteca')
      return res.status(400).send('Solo se pueden reparar libros que estén en biblioteca.');

    await Repair.create({ fecha_ingreso, motivo, cod_libro });

    res.redirect('/repairs/list');
  } catch (error) {
    console.error('Error al registrar la reparación:', error);
    res.status(500).send('Error al registrar la reparación.');
  }
};

/**
 * ✏️ Mostrar formulario para editar una reparación
 */
repairController.formEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const reparacion = await Repair.findByPk(id, {
      include: [{ model: Libro, as: 'libro', attributes: ['titulo'] }]
    });

    if (!reparacion) return res.status(404).send('Reparación no encontrada.');

    res.render('repairs/edit', { reparacion: reparacion.get({ plain: true }) });
  } catch (error) {
    console.error('Error al cargar el formulario de edición:', error);
    res.status(500).send('Error al cargar el formulario.');
  }
};

/**
 * 🛠️ Editar una reparación (por ejemplo, agregar fecha de egreso)
 */
repairController.edit = async (req, res) => {
  try {
    const { id } = req.params;
    let { fecha_egreso, motivo } = req.body;

    const reparacion = await Repair.findByPk(id);
    if (!reparacion) return res.status(404).send('Reparación no encontrada.');

    // ✅ Convertir cadena vacía a null
    fecha_egreso = fecha_egreso && fecha_egreso.trim() !== '' ? fecha_egreso : null;

    await reparacion.update({ fecha_egreso, motivo });

    res.redirect('/repairs/list');
  } catch (error) {
    console.error('Error al actualizar la reparación:', error);
    res.status(500).send('Error al actualizar la reparación.');
  }
};

/**
 * 🗑️ Eliminar una reparación
 */
repairController.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const reparacion = await Repair.findByPk(id);

    if (!reparacion) return res.status(404).send('Reparación no encontrada.');

    await reparacion.destroy();

    res.redirect('/repairs/list');
  } catch (error) {
    console.error('Error al eliminar la reparación:', error);
    res.status(500).send('Error al eliminar la reparación.');
  }
};

module.exports = repairController;
