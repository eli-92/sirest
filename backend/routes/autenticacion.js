'use strict'
// Cargamos el controlador
var { autenticarUsuario, listarPermiso } = require('@controllers/autenticacion');

module.exports = (api, permiso) => {
    /**
     * @swagger
     * /autenticacion:
     *    post:
     *      description: autenticacion para reconocer los permiso
     */
    api.post('/autenticacion', autenticarUsuario);

    api.post('/autenticacion/listarPermiso', listarPermiso);
}