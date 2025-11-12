const Prestamo = require('../models/loanModel');
const DetallePrestamo = require('../models/loanDetailModel');
const Libro = require('../models/bookModel');
const Socio = require('../models/memberModel');
const sequelize = require('../database/connection');
const { Op } = require('sequelize');

const loanController = {};

// ==========================
// 1. Formulario de nuevo préstamo
// ==========================
loanController.renderNewForm = async (req, res) => {
    try {
        const librosDisponibles = await Libro.findAll({
            where: { estado: 'en biblioteca' },
            order: [['titulo', 'ASC']]
        });

        const socios = await Socio.findAll({
            order: [['nomyape', 'ASC']]
        });

        res.render('loans/new', {
            libros: librosDisponibles.map(l => l.get({ plain: true })),
            socios: socios.map(s => s.get({ plain: true }))
        });

    } catch (error) {
        console.error('Error al cargar formulario:', error);
        req.flash('error_msg', 'Error al cargar datos para préstamo.');
        res.redirect('/loans');
    }
};

// ==========================
// 2. Crear un nuevo préstamo
// ==========================
loanController.createLoan = async (req, res) => {
    const { id_socio, id_libros_array } = req.body;
    console.log('📦 Datos recibidos:', req.body);
    const t = await sequelize.transaction();

    try {
        // Verificar que haya al menos un libro seleccionado
        if (!id_libros_array || (Array.isArray(id_libros_array) && id_libros_array.length === 0)) {
            throw new Error('Debe seleccionar al menos un libro para registrar el préstamo.');
        }

        const librosIds = Array.isArray(id_libros_array) ? id_libros_array : [id_libros_array];

        const nuevoPrestamo = await Prestamo.create({
            id_socio,
            fecha_prestamo: new Date().toISOString().split('T')[0],
            estado_prestamo: 'vigente'
        }, { transaction: t });

        const id_prestamo = nuevoPrestamo.id_prestamo;

        const detalles = [];
        for (const id_libro of librosIds) {
            const libro = await Libro.findByPk(id_libro);

            if (!libro) {
                throw new Error(`El libro ID ${id_libro} no fue encontrado.`);
            }

            if (libro.estado !== 'en biblioteca') {
                throw new Error(`El libro ID ${id_libro} no está disponible para préstamo (estado actual: ${libro.estado}).`);
            }

            await Libro.update(
                { estado: 'prestado' },
                { where: { id_libro }, transaction: t }
            );

            detalles.push({
                id_prestamo,
                id_libro,
                observaciones: ''
            });
        }

        await DetallePrestamo.bulkCreate(detalles, { transaction: t });
        await t.commit();

        req.flash('success_msg', `Préstamo #${id_prestamo} registrado correctamente.`);
        res.redirect('/loans');

    } catch (error) {
        await t.rollback();
        console.error('Error al registrar préstamo:', error);
        req.flash('error_msg', error.message);
        res.redirect('/loans/new');
    }
};

// ==========================
// 3. Marcar un préstamo como devuelto
// ==========================
loanController.markAsReturned = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const prestamo = await Prestamo.findByPk(id, {
            include: { model: DetallePrestamo, as: 'detalles' },
            transaction: t
        });

        if (!prestamo) {
            throw new Error('Préstamo no encontrado.');
        }

        // Cambiar estado del préstamo
        prestamo.estado_prestamo = 'devuelto';
        prestamo.fecha_devolucion = new Date().toISOString().split('T')[0];
        await prestamo.save({ transaction: t });

        // Marcar los libros como "en biblioteca"
        for (const detalle of prestamo.detalles) {
            await Libro.update(
                { estado: 'en biblioteca' },
                { where: { id_libro: detalle.id_libro }, transaction: t }
            );
        }

        await t.commit();
        req.flash('success_msg', `Préstamo #${id} marcado como devuelto.`);
        res.redirect('/loans');

    } catch (error) {
        await t.rollback();
        console.error('Error al marcar préstamo como devuelto:', error);
        req.flash('error_msg', 'Error al marcar préstamo como devuelto.');
        res.redirect('/loans');
    }
};

// ==========================
// 4. Listar préstamos
// ==========================
loanController.listLoans = async (req, res) => {
    try {
        const prestamos = await Prestamo.findAll({
            include: [
                { model: Socio, as: 'socio', attributes: ['nomyape'] },
                {
                    model: DetallePrestamo,
                    as: 'detalles',
                    include: { model: Libro, as: 'Libro', attributes: ['titulo', 'autor', 'id_libro'] }
                }
            ],
            order: [['fecha_prestamo', 'DESC']]
        });

        const prestamosFormateados = prestamos.map(p => {
            const plain = p.get({ plain: true });
            const nomyape_socio = plain.socio ? plain.socio.nomyape : 'N/A';
            const librosPrestados = plain.detalles.map(d =>
                d.Libro ? `${d.Libro.titulo} (ID: ${d.Libro.id_libro})` : 'Libro no encontrado'
            ).join('; ');

            return {
                ...plain,
                nomyape_socio,
                librosPrestados,
                fecha_prestamo_fmt: new Date(plain.fecha_prestamo).toLocaleDateString('es-ES'),
                fecha_devolucion_fmt: plain.fecha_devolucion
                    ? new Date(plain.fecha_devolucion).toLocaleDateString('es-ES')
                    : null,
                isVigente: plain.fecha_devolucion === null && plain.estado_prestamo === 'vigente'
            };
        });

        res.render('loans/list', {
            prestamos: prestamosFormateados,
            pageTitle: 'Listado de Préstamos'
        });

    } catch (error) {
        console.error('Error al listar préstamos:', error);
        req.flash('error_msg', 'Error al cargar listado.');
        res.redirect('/');
    }
};

// ==========================
// 5. Eliminar préstamo
// ==========================
loanController.deleteLoan = async (req, res) => {
    const { id } = req.params;
    try {
        const prestamo = await Prestamo.findByPk(id);
        if (!prestamo) {
            req.flash('error_msg', 'Préstamo no encontrado.');
            return res.redirect('/loans');
        }

        if (prestamo.estado_prestamo === 'vigente') {
            req.flash('error_msg', 'No se puede eliminar un préstamo vigente.');
            return res.redirect('/loans');
        }

        await Prestamo.destroy({ where: { id_prestamo: id } });
        req.flash('success_msg', `Préstamo #${id} eliminado correctamente.`);
        res.redirect('/loans');
    } catch (error) {
        console.error('Error al eliminar préstamo:', error);
        req.flash('error_msg', 'Error al eliminar préstamo.');
        res.redirect('/loans');
    }
};

module.exports = loanController;