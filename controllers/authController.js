/*
Creá el archivo controllers/auth.controller.js
para contener la lógica del registro y logout. La lógica del login ya está en passport.js.
*/


// Importa la librería bcryptjs, que se utilizará para generar el hash
// (cifrado) de las contraseñas antes de almacenarlas en la base de datos.
const bcrypt = require('bcryptjs');
// Importa el Modelo de Sequelize Usuario,
// necesario para interactuar con la tabla de usuarios (buscar, crear) en la base de datos
const Usuario = require('../models/userModel');
// Inicializa un objeto vacío llamado authController. 
// Este objeto contendrá todas las funciones controladoras de la lógica de autenticación (registro, login, logout).
const authController = {};

// Mostrar formulario de Login
/*
Define la función controladora para mostrar el formulario de inicio de sesión
Usa el método res.render() de Express para renderizar la vista de Handlebars llamada login.hbs
(o el nombre de archivo correspondiente).
*/


authController.renderLoginForm = (req, res) => {
  res.render('login'); 
};

// Lógica de Registro (POST)
authController.registerUser = async (req, res) => {
  const { user, password, confirm_password } = req.body;
  const errors = [];

  // Validaciones
  if (!user || !password || !confirm_password) {
    errors.push({ text: 'Por favor, llena todos los campos.' });
  }
  if (password !== confirm_password) {
    errors.push({ text: 'Las contraseñas no coinciden.' });
  }
  if (password.length < 4) {
    errors.push({ text: 'La contraseña debe tener al menos 4 caracteres.' });
  }

  if (errors.length > 0) {
    return res.render('register', { errors, user, password, confirm_password });
  }

  // 1. Verificar si el usuario ya existe
  const userFound = await Usuario.findOne({ where: { user: user } });
  if (userFound) {
    req.flash('error_msg', 'El usuario ya existe.');
    return res.redirect('/register');
  }

  try {
    // 2. Encriptación de contraseñas con bcrypt (Lógica de complejidad alta requerida)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Crear nuevo usuario
    await Usuario.create({
      user: user,
      password: hashedPassword
    });

    req.flash('success_msg', 'Registro exitoso. ¡Ya puedes iniciar sesión!');
    res.redirect('/login');

  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error al registrar el usuario.');
    res.redirect('/register');
  }
};

// Cerrar Sesión (Logout)
authController.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) { 
        return next(err); 
    }
    req.flash('success_msg', 'Sesión cerrada correctamente.');
    res.redirect('/login');
  });
};

// Nueva función para manejar la ruta raíz ('/')
authController.redirectToHomeOrLogin = (req, res) => {
    if (req.isAuthenticated()) {
        // Si ya inició sesión, enviarlo directamente al menú.
        res.redirect('/home');
    } else {
        // Si no ha iniciado sesión, enviarlo al formulario de login.
        res.redirect('/login');
    }
};

module.exports = authController;