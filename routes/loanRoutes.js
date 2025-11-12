const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middlewares/authMiddleware');
const loanDetailController = require('../controllers/loanDetailController');

// Todas las rutas de préstamos requieren autenticación
router.use(authMiddleware.ensureAuthenticated);

// --- Rutas de Gestión de Préstamos ---

// 1. Listado de préstamos
router.get('/', loanController.listLoans);

// 2. Formulario para nuevo préstamo
router.get('/new', loanController.renderNewForm);

// 3. Crear nuevo préstamo
router.post('/', loanController.createLoan);

// 4. Marcar préstamo como devuelto
router.put('/return/:id', loanController.markAsReturned);

// 5. Eliminar préstamo
router.delete('/:id', loanController.deleteLoan);

// Ruta para ver detalle del préstamo
router.get('/:id/detalle', loanDetailController.loanDetail);

module.exports = router;
