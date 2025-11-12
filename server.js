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
// mensajes basados en sesiones que solo se mostrarán una vez
// (típico para notificaciones de éxito o error).
const flash = require('connect-flash');
// Importa el módulo path de Node.js,
// utilizado para construir rutas de archivo de forma segura
// y consistente en diferentes sistemas operativos.
const path = require('path');
// Importa la función create de la librería express-handlebars
// para configurar el motor de plantillas.
const { create } = require('express-handlebars');
// Importar la configuración de passport
const passport = require('./middlewares/passport');
// Carga las variables de entorno del archivo .env en process.env
require('dotenv').config();

// 📢 CAMBIO REQUERIDO 1: Importar method-override
const methodOverride = require('method-override');

// *******************************************************************************
// Importación de Sequelize, Modelos y Definición de Asociaciones
// *******************************************************************************

// Importar la instancia de Sequelize
const sequelize = require('./database/connection');

// Importar todos los modelos y guardar sus referencias
const Libro = require('./models/bookModel');
const Socio = require('./models/memberModel');
const Prestamo = require('./models/loanModel');
const DetallePrestamo = require('./models/loanDetailModel');


// --------------------------- DEFINICIÓN DE ASOCIACIONES ---------------------------
// ⚙️ Todas las relaciones y alias deben coincidir exactamente con los usados en los controladores.

// 1️⃣ Socio ↔ Prestamo (1:N)
Socio.hasMany(Prestamo, { foreignKey: 'id_socio', as: 'prestamos' });
Prestamo.belongsTo(Socio, { foreignKey: 'id_socio', as: 'socio' });

// 2️⃣ Prestamo ↔ DetallePrestamo (1:N)
Prestamo.hasMany(DetallePrestamo, {
    foreignKey: 'id_prestamo',
    as: 'detalles',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
DetallePrestamo.belongsTo(Prestamo, { foreignKey: 'id_prestamo', as: 'prestamo' });

// 3️⃣ Libro ↔ DetallePrestamo (1:N)
Libro.hasMany(DetallePrestamo, {
    foreignKey: 'id_libro',
    as: 'detallesPrestamo',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
DetallePrestamo.belongsTo(Libro, { foreignKey: 'id_libro', as: 'Libro' });
// ⚠️ Nota: el alias 'Libro' con L mayúscula es el mismo usado en tu controlador.

// -----------------------------------------------------------------------------
// CONFIGURACION HANDLEBARS
// -----------------------------------------------------------------------------
const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: (a, b) => a === b,
        and: (a, b) => a && b,
        or: (a, b) => a || b,
        not: (a) => !a
    }
});

// -----------------------------------------------------------------------------
// SETTINGS
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// -----------------------------------------------------------------------------
// MIDDLEWARES
// -----------------------------------------------------------------------------
// <-- CAMBIO IMPORTANTE: extended: true para que express.parse recog
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 📢 method-override para soportar PUT y DELETE desde formularios HTML
app.use(methodOverride('_method'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'assets')));

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key-sgcb',
    resave: false,
    saveUninitialized: false
}));

// Mensajes flash
app.use(flash());

// Passport (debe ir después de la sesión)
app.use(passport.initialize());
app.use(passport.session());

// Variables globales (para Handlebars)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Error de Passport
    res.locals.user = req.user || null;
    next();
});

// -----------------------------------------------------------------------------
// RUTAS
// -----------------------------------------------------------------------------
const routes = require('./routes/routes');
const bookRoutes = require('./routes/bookRoutes');
const memberRoutes = require('./routes/memberRoutes');
const loanRoutes = require('./routes/loanRoutes');

app.use('/', routes);
app.use('/books', bookRoutes);
app.use('/members', memberRoutes);
app.use('/loans', loanRoutes);

// -----------------------------------------------------------------------------
// INICIO DEL SERVIDOR Y SINCRONIZACIÓN
// -----------------------------------------------------------------------------
async function startServer() {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados con la base de datos (Tablas creadas/actualizadas).');

        app.listen(app.get('port'), () => {
            console.log(`Servidor corriendo en el puerto: ${app.get('port')}`);
        });

    } catch (error) {
        console.error('❌ Error fatal al sincronizar la DB o iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();