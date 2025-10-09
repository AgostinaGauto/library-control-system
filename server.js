const express= require('express');
const app= express();
const session= require('express-session');
const flash= require('connect-flash');
require('dotenv').config();


//-------------------------------- CONFIGURACION HANDLEBARS------------------------------
const {create} = require('express-handlebars');
const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts',
    helpers: { 
        eq: function (a, b) {
            return a === b;
        }
    }
});

//------------------------------ MIDDLEWARES ---------------------------------------
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

//----------------------------- INICIAR SERVIDOR -----------------------------------
app.listen(process.env.PORT, () =>{
    console.log("Servidor corriendo en el puerto: "+ process.env.PORT);

});