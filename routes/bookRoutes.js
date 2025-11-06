const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); 
// Asumo que tu controlador se llama bookController para ser coherente
const bookController = require('../controllers/bookController'); 

// RUTA FINAL: /books (Listado)
router.get('/', ensureAuthenticated, bookController.listBooks);

// RUTA FINAL: /books/new
router.get('/new', ensureAuthenticated, bookController.renderNewForm);
router.post('/new', ensureAuthenticated, bookController.createBook);

// RUTA FINAL: /books/edit/:id
router.get('/edit/:id', ensureAuthenticated, bookController.renderEditForm);
router.post('/edit/:id', ensureAuthenticated, bookController.updateBook);

// RUTA FINAL: /books/delete/:id
router.post('/delete/:id', ensureAuthenticated, bookController.deleteBook); 

module.exports = router;