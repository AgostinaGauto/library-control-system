// Este archivo crea este middleware para asegurar que solo los usuarios autenticados 
// puedan acceder a ciertas rutas (como /home).

const authMiddleware = {};

// Verifica si el usuario está autenticado
authMiddleware.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Si no está autenticado, manda un mensaje y redirige al login
    req.flash('error_msg', 'Necesitas iniciar sesión para ver esta página.');
    res.redirect('/login');
};

module.exports = authMiddleware;