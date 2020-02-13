require('module-alias/register');
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var cors = require('cors')
var socketIO = require('socket.io');
var http = require('http')

const port = process.env.PORT || 3000;
var { validarToken, validarDireccionEquipo } = require("@middleware/autenticacion");
var endpoints = require('@routes/endpoints');
//var swaggerDoc = require('@root/swaggerDoc');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(validarToken);
app.use(validarDireccionEquipo);
app.use(expressValidator());

//var allowedOrigins = ['https://hotelaasi.herokuapp.com']; //Produccion
var allowedOrigins = ['http://localhost:3000'];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'el CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
endpoints(app); // Carga todas las rutas


const server = http.createServer(app);
server.listen(port, function() {
    console.log(`Node server cargando en:  http://localhost:${port}`);
});