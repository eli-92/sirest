'use strict'
const connection = require('@root/sqlConection');
const crypto = require('crypto');
var sql = require('mssql');
const jwt = require('jsonwebtoken');
const { secret, secretToken } = require('@middleware/configuracion');

module.exports = {
    autenticarUsuario: async function(req, res) {

        const { NombreUsuario, Contrasena } = req.body;
        let peticionAutenticacionUsuario = await connection.request()
            .input('NombreUsuario', sql.VarChar(50), NombreUsuario)
            .query('SELECT IdUsuario, IdRol, NombrePersonal, NombreUsuario, CorreoElectronico, Telefono, Contrasena FROM Usuario WHERE NombreUsuario = @NombreUsuario AND IdEstadoRegistro = 1');

        let dato = peticionAutenticacionUsuario.recordset[0];

        if (dato == "" || dato == undefined || dato == null) {
            return res.status(201).json({
                exito: false,
                mensaje: 'Usuario o contraseña incorrecta, por favor intentelo nuevamente.',
                dato: {}
            });
        }

        let payload = {
            idUsuario: dato.IdUsuario,
            idRol: dato.IdRol,
            nombrePersonal: dato.NombrePersonal,
            nombreUsuario: dato.NombreUsuario,
            correoElectronico: dato.CorreoElectronico,
            telefono: dato.Telefono
        }

        let validadorContrasena = crypto.createHmac('sha256', secret)
            .update(Contrasena)
            .digest('hex');

        if (validadorContrasena == dato.Contrasena) {

            let peticionListaPermiso = await connection.request()
                .input('IdUsuario', sql.Int, dato.IdUsuario)
                .execute('[dbo].[FiltrarPermisoPorUsuario]');

            let listaPermiso = peticionListaPermiso.recordset;

            let token = jwt.sign(payload,
                secretToken, {
                    expiresIn: "365d"
                }
            );
            return res.status(201).json({
                exito: true,
                mensaje: 'Usuario exito!!!',
                dato: {
                    token: token,
                    listaPermiso,
                    idUsuario: dato.IdUsuario
                }
            });
        } else {
            return res.status(201).json({
                exito: false,
                mensaje: 'Contraseña incorrecto!!!',
                dato: {}
            });
        }
    },
    listarPermiso: async function(req, res) {
        let request = connection.request();
        request.input('IdUsuario', sql.Int, res.locals.usuario.idUsuario);
        request.execute('[dbo].[FiltrarPermisoPorUsuario]', async function(err, recordset) {
            if (err) res.status(500).send(err);
            return res.status(200).send(await recordset.recordset); //Return a recordset from here rather than printing it
        });
    }

}