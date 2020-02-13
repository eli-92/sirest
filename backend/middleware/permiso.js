'user strict'
var sql = require('mssql');
const connection = require('@root/sqlConection');

// middleware for doing role-based permissions
function permiso(idPermiso) {
    // return a middleware
    return async(req, res, next) => {
        console.log('permiso de cada tarea');
        let request = connection.request();
        request.input('IdUsuario', sql.Int, res.locals.usuario.idUsuario);
        request.input('IdPermiso', sql.VarChar, idPermiso);
        request.execute('[dbo].[ComprobarTienePermiso]', function(err, recordset) {
            if (err) console.log(err);
            if (res.locals.usuario && recordset.recordset.length > 0) {
                next();
            } else {
                return res.status(403).json({ exito: false, mensaje: "No posee los permisos suficientes para realizar esta acción." }); // user is forbidden
            }
        });
    }
}

module.exports = {
    permiso
}