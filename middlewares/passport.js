/*

Este código configura Passport, un middleware de autenticación para Node.js,
utilizando la estrategia Local (autenticación basada en usuario y contraseña)
y el módulo bcrypt para manejar el hashing de contraseñas (hashing hace referencia a la encriptacion de contraseñas).
*/
const passport = require('passport');
/*
Importa la Estrategia Local (LocalStrategy) 
del módulo passport-local.
Esta estrategia está diseñada específicamente para autenticar 
con nombre de usuario y contraseña.
*/
const LocalStrategy = require('passport-local').Strategy;
/*
Importa la librería bcryptjs, que se utiliza para comparar la contraseña 
ingresada por el usuario con la versión hasheada (cifrada) 
almacenada en la base de datos.
*/
const bcrypt = require('bcryptjs');
/*
Importa el Modelo Usuario de Sequelize (el que definiste anteriormente), 
necesario para interactuar con la tabla de usuarios y buscar credenciales.
*/
const Usuario = require('../models/userModel');

passport.use(new LocalStrategy({
    usernameField: 'user', // El campo que Express recibirá para el usuario
    passwordField: 'password' // El campo que Express recibirá para la contraseña
  }, 
  async (user, password, done) => {
    try {
      // 1. Buscar el usuario en la base de datos
      const usuario = await Usuario.findOne({ where: { user: user } });
      
      if (!usuario) {
        return done(null, false, { message: 'Usuario no encontrado.' });
      }

      // 2. Comparar la contraseña (lógica de complejidad alta requerida)
      const isMatch = await bcrypt.compare(password, usuario.password);
      
      if (!isMatch) {
        return done(null, false, { message: 'Contraseña incorrecta.' });
      }

      // 3. Usuario y contraseña correctos
      return done(null, usuario);
      
    } catch (err) {
      return done(err);
    }
  }
));

// Serializar: Guarda el ID del usuario en la sesión
/*
Define la función de Serialización.
Después de que un usuario es autenticado con éxito, 
esta función decide qué información del usuario se debe almacenar 
en la sesión del usuario (normalmente, solo el ID).
Llama a done pasando el id_usuario.
*/
passport.serializeUser((usuario, done) => {
  done(null, usuario.id_usuario);
});

// Deserializar: Busca el usuario completo a partir del ID en la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findByPk(id);
    done(null, usuario);
  } catch (err) {
    done(err, null);
  }
});

/*
Exporta la instancia de Passport configurada,
para que pueda ser utilizada e inicializada en el archivo principal 
de la aplicación (ej. app.js o server.js).
*/
module.exports = passport;