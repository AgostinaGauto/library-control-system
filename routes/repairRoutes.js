const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');

// Listado principal
router.get('/list', repairController.list);

// Crear
router.get('/add', repairController.formAdd);
router.post('/add', repairController.add);

// Editar
router.get('/edit/:id', repairController.formEdit);
router.post('/edit/:id', repairController.edit);

// Eliminar
router.get('/delete/:id', repairController.delete);

module.exports = router;
