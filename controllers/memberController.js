const Socio = require('../models/memberModel');
const { SequelizeValidationError, SequelizeUniqueConstraintError } = require('sequelize'); // Importamos los errores de Sequelize

const memberController = {};

// 1. LISTAR SOCIOS
memberController.listMembers = async (req, res) => {
    try {
        const socios = await Socio.findAll({ // Cambiado a 'socios' para mayor claridad
            order: [['nomyape', 'ASC']]
        });

        const sociosFormateados = socios.map(socioInstancia => ({ 
            ...socioInstancia.get({ plain: true }), 
            // Formatea la fecha para la vista de listado
            fecha_nacimiento_fmt: socioInstancia.fecha_nacimiento ? new Date(socioInstancia.fecha_nacimiento).toLocaleDateString('es-ES') : ''
        }));

        res.render('members/list', {
            socios: sociosFormateados,
            pageTitle: 'Listado de socios'
        });

    } catch (error) {
        console.error('Error al listar socios:', error);
        req.flash('error_msg', 'Error al cargar el listado de socios.');
        res.redirect('/home');
    }
};

// 2. RENDERIZAR FORMULARIO DE ALTA
memberController.renderNewForm = async (req, res) => {
    res.render('members/new');
};

// 3. CREAR SOCIO (Con manejo de errores de validación)
memberController.createMember = async (req, res) => {
    const { nomyape, fecha_nacimiento, telefono, email } = req.body;
    
    // Objeto para los datos a crear
    const newMemberData = {
        nomyape,
        fecha_nacimiento,
        telefono,
        email
    };

    try {
        // La validación se maneja implícitamente por Sequelize antes de la inserción
        await Socio.create(newMemberData); 

        req.flash('success_msg', 'Socio registrado exitosamente');
        res.redirect('/members');

    } catch (error) {
        console.error('Error al registrar el socio:', error);
        let errorMessages = 'Error interno al registrar el socio.';

        // --- MANEJO DE ERRORES DE VALIDACIÓN DE SEQUELIZE ---
        if (error.name === 'SequelizeValidationError') {
            // Recopila todos los mensajes de error de validación definidos en el modelo
            errorMessages = error.errors.map(err => err.message).join('<br>');
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            // Maneja el error de email duplicado
            errorMessages = 'Error: el email ya se encuentra registrado por otro socio.';
        }
        
        req.flash('error_msg', errorMessages);
        res.redirect('/members/new');
    }
};

// 4. RENDERIZAR FORMULARIO DE EDICIÓN
memberController.renderEditForm = async (req, res) => { 
    try {
        const { id } = req.params;
        const socio = await Socio.findByPk(id);

        if (!socio) {
            req.flash('error_msg', 'Socio no encontrado para editar');
            return res.redirect('/members');
        }

        const fecha_nacimiento_formatted = socio.fecha_nacimiento ? new Date(socio.fecha_nacimiento).toISOString().split('T')[0] : '';

        res.render('members/edit', {
            socio: socio.get({ plain: true }),
            fecha_nacimiento_formatted
        });

    } catch (error) {
        console.log('Error al cargar el formulario de edición del socio:', error);
        req.flash('error_msg', 'Error al cargar los datos del socio');
        res.redirect('/members');
    }
};


// 5. ACTUALIZAR SOCIO (Con manejo de errores de validación)
memberController.updateMember = async (req, res) => {
    const { id } = req.params;
    const { nomyape, fecha_nacimiento, telefono, email } = req.body;

    // Objeto para los datos a actualizar
    const updatedMemberData = {
        nomyape,
        fecha_nacimiento: fecha_nacimiento || null,
        telefono,
        email
    };
    
    try {
        const [updatedRows] = await Socio.update(updatedMemberData, {
            where: { id_socio: id },
            // IMPORTANTE: 'individualHooks: true' asegura que las validaciones del modelo
            // se ejecuten también en la actualización.
            individualHooks: true 
        });
        
        if (updatedRows === 0) {
            req.flash('error_msg', 'Socio no encontrado o sin cambios para actualizar.');
            return res.redirect('/members');
        }

        req.flash('success_msg', 'Socio actualizado exitosamente.');
        res.redirect('/members');

    } catch (error) {

        console.error('Error al actualizar socio:', error);
        let errorMessages = 'Error interno al actualizar el socio.';

        // --- MANEJO DE ERRORES DE VALIDACIÓN DE SEQUELIZE ---
        if (error.name === 'SequelizeValidationError') {
            errorMessages = error.errors.map(err => err.message).join('<br>');
        } else if (error.name === 'SequelizeUniqueConstraintError') {
            errorMessages = 'Error: El email ya se encuentra registrado por otro socio.';
        }
        
        req.flash('error_msg', errorMessages);
        res.redirect(`/members/edit/${id}`);
    }
};


// 6. ELIMINAR SOCIO
memberController.deleteMember = async (req, res) => {
    const { id } = req.params;

    try {
        // Lógica futura: DEBES validar aquí que el socio no tenga préstamos activos antes de eliminar.
        
        const deleted = await Socio.destroy({
            where: { id_socio: id }
        });

        if (deleted) {
            req.flash('success_msg', 'Socio eliminado exitosamente.');

        } else {
            req.flash('error_msg', 'Socio no encontrado para eliminar.'); 
        }

        res.redirect('/members');

    } catch (error) {

        // En caso de que el socio tenga préstamos asociados y la DB imponga restricción FK
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            req.flash('error_msg', 'No se puede eliminar el socio porque tiene préstamos asociados.');
        } else {
            req.flash('error_msg', 'Error interno al eliminar el socio.');
        }

        console.error('Error al eliminar el socio:', error);
        res.redirect('/members');

    }
};

module.exports = memberController;