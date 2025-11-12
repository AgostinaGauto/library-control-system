// Importamos Express Router
const express = require('express');
const router = express.Router();

// Importamos el controlador de socios
const memberController = require('../controllers/memberController');
// Importamos el middleware de autenticación (asumiendo que lo tienes)
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas de socios requieren que el usuario esté autenticado
router.use(authMiddleware.ensureAuthenticated);

// --- Rutas de Gestión de Socios ---

// 1. Mostrar Listado de Socios (GET /members)
router.get('/', memberController.listMembers);

// 2. Mostrar Formulario de Nuevo Socio (GET /members/new)
router.get('/new', memberController.renderNewForm);

// 3. Crear Nuevo Socio (POST /members)
router.post('/', memberController.createMember);

// 4. Mostrar Formulario de Edición (GET /members/edit/:id)
router.get('/edit/:id', memberController.renderEditForm);

// 5. Actualizar Socio (PUT /members/:id)
// CORRECCIÓN CLAVE: Quitamos '/edit' de la ruta PUT
router.put('/:id', memberController.updateMember); 

// 6. Eliminar Socio (DELETE /members/:id)
router.delete('/:id', memberController.deleteMember);


module.exports = router;