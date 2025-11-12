// Este archivo maneja las rutas montadas en app.use('/', routes)

const express = require('express');
const router = express.Router();

// Importamos los controladores y middlewares necesarios
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// ----------------------------------------------------------------------
// RUTAS DE ACCESO PÚBLICO (SIN PROTECCIÓN)
// ----------------------------------------------------------------------

// 1. LOGIN (GET /login y POST /login)
router.get('/login', authController.renderLoginForm);
router.post('/login', authController.login); 

// 2. REGISTRO (GET /register y POST /register)
router.get('/register', authController.renderRegisterForm); 
router.post('/register', authController.registerUser); 

// ----------------------------------------------------------------------
// RUTAS DE ACCESO PRIVADO (REQUIEREN AUTENTICACIÓN)
// ----------------------------------------------------------------------

// 3. DASHBOARD / HOME (GET /)
// Aquí se aplica el Guarda de Seguridad. Si no está logueado, redirige a /login.
router.get('/', authMiddleware.ensureAuthenticated, (req, res) => {
    // Si la autenticación es exitosa, se llega a esta línea
    // CORRECCIÓN: Renderizamos la vista de contenido 'home' (home.hbs). 
    // Handlebars automáticamente usará el layout 'layouts/main.hbs' para envolverla.
    res.render('home', {
        title: 'Inicio',
        // req.user contiene el objeto usuario completo gracias a deserializeUser
        user: req.user 
    });
});

// 4. CERRAR SESIÓN (GET /logout)
router.get('/logout', authController.logout);


module.exports = router;