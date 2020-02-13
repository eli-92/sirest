var express = require("express");
var path = require('path');
var api = express.Router();
var { permiso } = require('@middleware/permiso');
//require('@routes/articulo.js')(api, permiso);


module.exports = (app) => {
    app.use('/api', api),
        /*  app.use('/', express.static('public', { redirect: false }))
    app.get('*', function(req, res, next) {
            res.sendFile(path.resolve('public/index.html'))
        }),*/
        app.use('/uploads', express.static(path.resolve('uploads')));
};