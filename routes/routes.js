/*
Este código define el enrutador principal de una aplicación Express,
organizando todas las URL (rutas) y asociándolas a las funciones controladoras 
o middlewares correspondientes para manejar la autenticación y la navegación.
*/
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser, logout, renderLoginForm, redirectToHomeOrLogin } = require('../controllers/authController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware'); 

// Importación de rutas modulares
const libroRoutes = require('./bookRoutes'); 
// Aquí se importarán otros módulos: socioRoutes, prestamoRoutes, etc.

// 1. Ruta Raíz
router.get('/', redirectToHomeOrLogin); // Lógica implementada en el controlador

// 2. Rutas de Autenticación
router.get('/login', renderLoginForm);

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    successRedirect: '/home' // Redirige al Menú de Navegación
}));

router.get('/register', (req, res) => res.render('register'));
router.post('/register', registerUser);

router.get('/logout', logout);

// 3. Ruta de Menú de Navegación (Protegida)
router.get('/home', ensureAuthenticated, (req, res) => {
    // Esta vista es el menú principal protegido
    res.render('home', { user: req.user });
});

// 4. Módulos ABMC (Rutas Modulares)
// Esto aplica el prefijo '/libros' a todas las rutas definidas en libroRoutes.js
router.use('/books', libroRoutes); 

// Aquí se agregarán las rutas para otros módulos (Socios, Préstamos, etc.)

module.exports = router;