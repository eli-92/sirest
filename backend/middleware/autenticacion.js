const jwt = require('jsonwebtoken');
const { secretToken } = require('@middleware/configuracion');
var sql = require('mssql');
const connection = require('@root/sqlConection');
/*Verifica que el token enviado por el cliente sea valido */

var validarToken = function(req, res, next) {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1]; ///Crea el codigo del token
            const decoded = jwt.verify(token, secretToken); /// verifica la del token y la llave

            if (decoded)
                res.locals.usuario = decoded;
        }
    } catch (error) {
        return res.status(401).json({
            message: 'No se creo la autenticacion del token'
        });
    }
    next();
};

/*Verifica que el usuario no este intentando realizar peticiones multiples al servidor */
var validarDireccionEquipo = async(req, res, next) => {
    console.log('validarDireccionEquipo');

    const fechaHoraActual = new Date();
    let direccionEquipo = req.connection.remoteAddress;
    //Obtengo los parametros sistemas validos antes de ejecutar lo demas.
    let peticionTiempoMilisegundoPeticionMaximo = await connection.request()
        .input('IdParametroSistema', sql.VarChar, "TIEMPO_MILISEGUNDO_PETICION_MAXIMO")
        .query('SELECT Valor FROM dbo.ParametroSistema WHERE IdParametroSistema = @IdParametroSistema')

    let peticionCantidadPeticionMaximo = await connection.request()
        .input('IdParametroSistema', sql.VarChar, "CANTIDAD_PETICION_MAXIMO")
        .query('SELECT Valor FROM dbo.ParametroSistema WHERE IdParametroSistema = @IdParametroSistema')

    let peticionHistorialDireccionEquipo = await connection.request()
        .input('DireccionEquipo', sql.VarChar, direccionEquipo)
        .input('FechaActual', sql.Date, fechaHoraActual)
        .query('SELECT CantidadPeticion, FechaUltimaEjecucion FROM dbo.HistorialDireccionEquipo WHERE DireccionEquipo = @DireccionEquipo AND Fecha = @FechaActual')

    const TIEMPO_MILISEGUNDO_PETICION_MAXIMO = peticionTiempoMilisegundoPeticionMaximo.recordset[0].Valor;
    const CANTIDAD_PETICION_MAXIMO = peticionCantidadPeticionMaximo.recordset[0].Valor;

    if (peticionHistorialDireccionEquipo.recordset.length) {

        let {
            CantidadPeticion: cantidadPeticion,
            FechaUltimaEjecucion: fechaUltimaEjecucion
        } = peticionHistorialDireccionEquipo.recordset[0];

        if (cantidadPeticion >= CANTIDAD_PETICION_MAXIMO)
            return res.status(403).json({ message: "El Estado no esta disponible" });

        let peticion = cantidadPeticion;

        if ((fechaHoraActual - fechaUltimaEjecucion) <= TIEMPO_MILISEGUNDO_PETICION_MAXIMO)
            peticion += 1;

        await connection.request()
            .input('Fecha', sql.Date, fechaHoraActual)
            .input('DireccionEquipo', sql.VarChar(50), direccionEquipo)
            .input('CantidadPeticion', sql.Int, peticion)
            .input('FechaUltimaEjecucion', sql.DateTime, fechaHoraActual)
            .execute('[dbo].[ActualizarHistorialDireccionEquipo]');
        next();
    } else {

        await connection.request()
            .input('Fecha', sql.Date, fechaHoraActual)
            .input('DireccionEquipo', sql.VarChar(50), direccionEquipo)
            .input('CantidadPeticion', sql.Int, 1)
            .input('FechaUltimaEjecucion', sql.DateTime, fechaHoraActual)
            .execute('[dbo].[InsertarHistorialDireccionEquipo]');
        next();
    }

};

module.exports = {
    validarToken,
    validarDireccionEquipo
}