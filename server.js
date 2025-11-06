/*
Este código es un archivo de configuración principal
(típicamente app.js o server.js) para una aplicación Node.js
basada en Express, donde se inicializan el servidor, 
el motor de plantillas Handlebars, la conexión a la base de datos
y el sistema de autenticación Passport.js.
*/


// Importa el framework Express
const express = require('express');
// crea la instancia principal de la aplicación (app),
// que será el núcleo de nuestro servidor web.
const app = express();
// Importa el middleware express-session para gestionar sesiones 
// de usuario, lo que es crucial para la autenticación.
const session = require('express-session');
// Importa connect-flash, un middleware que permite almacenar
//  mensajes basados en sesiones que solo se mostrarán una vez
//  (típico para notificaciones de éxito o error).
const flash = require('connect-flash');
// Importa el módulo path de Node.js, 
// utilizado para construir rutas de archivo de forma segura
//  y consistente en diferentes sistemas operativos.
const path = require('path');
// Importa la función create de la librería express-handlebars
// para configurar el motor de plantillas.
const { create } = require('express-handlebars');
// Importar la configuración de passport
const passport = require('./middlewares/passport'); 
// Carga las variables de entorno del archivo .env en process.env
require('dotenv').config();

// ******************************************************************************
// CAMBIOS CLAVE: Importar Sequelize y Modelos para la Sincronización
// ******************************************************************************

// Importar la instancia de Sequelize
const sequelize = require('./database/connection'); 
// Importar los modelos para que Sequelize sepa qué sincronizar
require('./models/bookModel');
// Si ya has creado el de Socios: require('./models/socioModel');


// -------------------------------- CONFIGURACION HANDLEBARS ------------------------------
const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'), // Usar path.join para rutas relativas
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: function (a, b) {
            return a === b;
        }
    }
});

// ------------------------------ SETTINGS ---------------------------------------
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, 'views')); // Usar path.join para rutas relativas

// ------------------------------ MIDDLEWARES ---------------------------------------
// Parseo de datos
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Archivos Estáticos
app.use(express.static(path.join(__dirname, 'assets')));

// Sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-sgcb', // Usar una clave secreta del .env si existe
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Passport (debe ir después de la sesión)
app.use(passport.initialize());
app.use(passport.session());

// Variables Globales (para Handlebars y mensajes flash)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Mensaje de error de Passport
    res.locals.user = req.user || null; // Usuario autenticado disponible en las vistas
    next();
});

// ------------------------------ RUTAS ---------------------------------------
const routes = require('./routes/routes');
app.use('/', routes);


// ----------------------------- INICIAR SERVIDOR ASÍNCRONO -----------------------------------

async function startServer() {
    try {
        // Ejecutamos la sincronización de modelos de forma explícita y la esperamos.
        // Esto garantiza que la tabla 'libro' exista antes de montar las rutas.
        await sequelize.sync({ alter: true }); 
        console.log('✅ Modelos sincronizados con la base de datos (Tablas creadas/actualizadas).');

        // Solo después de sincronizar, iniciamos Express
        app.listen(app.get('port'), () => {
            console.log(`Servidor corriendo en el puerto: ${app.get('port')}`);
        });

    } catch (error) {
        console.error('❌ Error fatal al sincronizar la DB o iniciar el servidor:', error);
        // Salir del proceso si la conexión/sincronización falla
        process.exit(1); 
    }
}

// Llamar a la función de inicio
startServer();;