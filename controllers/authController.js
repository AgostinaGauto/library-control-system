/*
Este archivo contiene la lógica del controlador para las funciones de autenticación
(Registro, Login y Logout).

La lógica principal de autenticación (verificación de credenciales) está en passport.js.
Aquí solo se utiliza el middleware de Passport.
*/

// Importa la librería bcryptjs, que se utilizará para generar el hash
// (cifrado) de las contraseñas antes de almacenarlas en la base de datos.
const bcrypt = require('bcryptjs');
// Importa el Modelo de Sequelize Usuario
const Usuario = require('../models/userModel');
// Importa la instancia de Passport configurada para usar su middleware
const passport = require('../middlewares/passport');

// Inicializa el objeto controlador
const authController = {};

// 1. Mostrar formulario de Login (GET /login)
authController.renderLoginForm = (req, res) => {
  res.render('login', {
    title: 'Iniciar Sesión',
    // Asegúrate de pasar mensajes flash si los estás usando
    error_msg: req.flash('error_msg'),
    success_msg: req.flash('success_msg')
  }); 
};

// **NUEVA FUNCIÓN:** // 2. Mostrar formulario de Registro (GET /register)
authController.renderRegisterForm = (req, res) => {
    // Si la función de registro (POST) falla, usa req.flash para mantener los mensajes de error
    // En este caso, al ser un GET, solo pasamos los errores y mensajes existentes.
    res.render('register', { 
        title: 'Registro de Usuario',
        error_msg: req.flash('error_msg'),
        errors: req.flash('error_data') // Si usas req.flash para pasar errores de validación
    });
};


// 3. Lógica de Login (POST /login)
authController.login = passport.authenticate('local', {
    successRedirect: '/',       // Redirigir a la raíz si el login es exitoso
    failureRedirect: '/login',  // Redirigir de vuelta al formulario si falla
    failureFlash: true          // Permite que Passport use req.flash para enviar mensajes de error
});

// 4. Lógica de Registro (POST /register)
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
      // CORRECCIÓN CLAVE: Redirigir para GET /register, y usar flash para enviar los errores y datos
      req.flash('error_data', errors); // Guarda los errores en flash
      // Opcional: Guarda datos anteriores si los usas para rellenar el formulario.
      return res.redirect('/register');
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

// 5. Cerrar Sesión (GET /logout)
authController.logout = (req, res, next) => {
  // req.logout() es el método de Passport para limpiar la sesión
  req.logout((err) => {
    if (err) { 
        return next(err); 
    }
    req.flash('success_msg', 'Sesión cerrada correctamente.');
    res.redirect('/login');
  });
};


module.exports = authController;