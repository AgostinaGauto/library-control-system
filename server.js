/*
Este código es un archivo de configuración principal
(típicamente app.js o server.js) para una aplicación Node.js
basada en Express, donde se inicializan el servidor,
el motor de plantillas Handlebars, la conexión a la base de datos
y el sistema de autenticación Passport.js.
*/

// Importa el framework Express
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const { create } = require('express-handlebars');
const passport = require('./middlewares/passport');
require('dotenv').config();
const methodOverride = require('method-override');

// -----------------------------------------------------------------------------
// Importación de Sequelize, Modelos y Definición de Asociaciones
// -----------------------------------------------------------------------------
const sequelize = require('./database/connection');

// Importar todos los modelos
const Libro = require('./models/bookModel');
const Socio = require('./models/memberModel');
const Prestamo = require('./models/loanModel');
const DetallePrestamo = require('./models/loanDetailModel');
const Repair = require('./models/repairModel');

// --------------------------- DEFINICIÓN DE ASOCIACIONES ---------------------------
//  Socio ↔ Prestamo (1:N)
Socio.hasMany(Prestamo, { foreignKey: 'id_socio', as: 'prestamos' });
Prestamo.belongsTo(Socio, { foreignKey: 'id_socio', as: 'socio' });

//  Prestamo ↔ DetallePrestamo (1:N)
Prestamo.hasMany(DetallePrestamo, {
  foreignKey: 'id_prestamo',
  as: 'detalles',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
DetallePrestamo.belongsTo(Prestamo, {
  foreignKey: 'id_prestamo',
  as: 'prestamo'
});

//  Libro ↔ DetallePrestamo (1:N)
Libro.hasMany(DetallePrestamo, {
  foreignKey: 'id_libro',
  as: 'detallesPrestamo',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
DetallePrestamo.belongsTo(Libro, {
  foreignKey: 'id_libro',
  as: 'libroPrestamo' // ✅ alias cambiado para evitar conflicto
});

// Libro ↔ Repair (1:N)
Libro.hasMany(Repair, {
  foreignKey: 'cod_libro',
  sourceKey: 'id_libro',
  as: 'reparaciones',
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE'
});
Repair.belongsTo(Libro, {
  foreignKey: 'cod_libro',
  targetKey: 'id_libro',
  as: 'libroReparacion' //  alias único
});

// -----------------------------------------------------------------------------
// CONFIGURACIÓN HANDLEBARS
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
    not: (a) => !a,

    //  Helper para mostrar fechas en formato DD/MM/YYYY
    formatDate: (date) => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },

    //  Helper para mostrar fechas en <input type="date"> (YYYY-MM-DD)
    formatDateInput: (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    }
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'assets')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key-sgcb',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
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
const repairRoutes = require('./routes/repairRoutes');

app.use('/', routes);
app.use('/books', bookRoutes);
app.use('/members', memberRoutes);
app.use('/loans', loanRoutes);
app.use('/repairs', repairRoutes);

// -----------------------------------------------------------------------------
// INICIO DEL SERVIDOR Y SINCRONIZACIÓN
// -----------------------------------------------------------------------------
async function startServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log(' Modelos sincronizados con la base de datos.');

    app.listen(app.get('port'), () => {
      console.log(` Servidor corriendo en el puerto: ${app.get('port')}`);
    });
  } catch (error) {
    console.error(' Error al sincronizar la DB o iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
