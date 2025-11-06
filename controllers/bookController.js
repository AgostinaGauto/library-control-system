// CORRECCIÓN CLAVE: Usamos 'Libro' (Mayúscula) para referirnos al Modelo
const Libro = require('../models/bookModel');
const libroController = {}; // El objeto que contiene todas las funciones

// 1. LISTAR LIBROS
libroController.listBooks = async (req, res) => {
    try {
        // Usamos Libro (Modelo)
        const libros = await Libro.findAll({
            order: [['titulo', 'ASC']]
        });

        const librosFormateados = libros.map(libroInstancia => ({
            // Usamos libroInstancia (Instancia)
            ...libroInstancia.get({ plain: true }),
            fecha_edicion_fmt: libroInstancia.fecha_edicion ? new Date(libroInstancia.fecha_edicion).toLocaleDateString('es-ES') : ''
        }));

        res.render('books/list', { libros: librosFormateados });

    } catch (error) {
        console.error('Error al listar libros:', error);
        req.flash('error_msg', 'Error al cargar el catálogo de libros.');
        res.redirect('/home');
    }
};

// 2. RENDERIZAR FORMULARIO DE ALTA
libroController.renderNewForm = (req, res) => {
    res.render('books/new');
};

// 3. CREAR LIBRO
libroController.createBook = async (req, res) => {
    const { titulo, autor, editorial, fecha_edicion, idioma, cant_paginas } = req.body;

    if (!titulo || !autor) {
        req.flash('error_msg', 'El titulo y el autor son campos obligatorios.');
        return res.redirect('/books/new');
    }

    try {
        // Usamos Libro (Modelo)
        await Libro.create({
            titulo,
            autor,
            editorial,
            fecha_edicion,
            idioma,
            cant_paginas: cant_paginas ? parseInt(cant_paginas) : null
        });

        // CORRECCIÓN: success_msg (estaba como succes_msg)
        req.flash('success_msg', 'Libro registrado exitosamente.');
        res.redirect('/books');

    } catch (error) {
        console.error('Error al crear el libro:', error);
        req.flash('error_msg', 'Error interno al registrar el libro');
        res.redirect('/books/new');
    }
};

// 4. RENDERIZAR FORMULARIO DE EDICIÓN
libroController.renderEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        // CORRECCIÓN CLAVE: Usamos Libro (Modelo) y asignamos a libroEncontrado (Instancia)
        const libroEncontrado = await Libro.findByPk(id);

        if (!libroEncontrado) {
            req.flash('error_msg', 'Libro no encontrado para editar');
            return res.redirect('/books');
        }

        const fecha_edicion_formatted = libroEncontrado.fecha_edicion ? new Date(libroEncontrado.fecha_edicion).toISOString().split('T')[0] : '';

        res.render('books/edit', {
            libro: libroEncontrado.get({ plain: true }), // Usamos la instancia encontrada
            fecha_edicion_formatted
        });

    } catch (error) {
        console.error('Error al cargar formulario de edición:', error);
        req.flash('error_msg', 'Error al cargar los datos del libro.');
        res.redirect('/books');
    }
};

// 5. ACTUALIZAR LIBRO
libroController.updateBook = async (req, res) => {
    const { id } = req.params;
    const { titulo, autor, editorial, fecha_edicion, idioma, cant_paginas, estado } = req.body;

    if (!titulo || !autor) {
        req.flash('error_msg', 'El titulo y el autor son campos obligatorios');
        return res.redirect(`/books/edit/${id}`);
    }

    try {
        // Usamos Libro (Modelo)
        await Libro.update({
            titulo,
            autor,
            editorial,
            fecha_edicion: fecha_edicion || null,
            idioma,
            cant_paginas: cant_paginas ? parseInt(cant_paginas) : null,
            estado
        }, {
            where: { id_libro: id }
        });

        req.flash('success_msg', 'Libro actualizado exitosamente.');
        res.redirect('/books');

    } catch (error) {
        console.error('Error al actualizar libro:', error);
        req.flash('error_msg', 'Error interno al actualizar el libro.');
        res.redirect(`/books/edit/${id}`);

    }
};

// 6. ELIMINAR LIBRO
libroController.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        // CORRECCIÓN CLAVE: Usamos Libro (Modelo) y asignamos a libroEncontrado (Instancia)
        const libroEncontrado = await Libro.findByPk(id);

        if (!libroEncontrado) {
            req.flash('error_msg', 'Libro no encontrado');
            return res.redirect('/books');
        }

        // CORRECCIÓN LÓGICA: La validación estaba incorrecta.
        if (libroEncontrado.estado !== 'en biblioteca') {
            req.flash('error_msg', `Validación de Negocio: No se puede eliminar el libro. Estado actual: "${libroEncontrado.estado}". Debe estar en biblioteca.`);
            return res.redirect('/books');
        }

        // Usamos Libro (Modelo) para la eliminación.
        await Libro.destroy({
            where: { id_libro: id }
        });

        req.flash('success_msg', 'Libro eliminado exitosamente.');
        res.redirect('/books');

    } catch (error) {
        console.error('Error al eliminar el libro:', error);
        req.flash('error_msg', 'Error al eliminar el libro');
        res.redirect('/books');
    }
};

module.exports = libroController;
