'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta';

exports.createToken = function(usuario){

    var payload ={
        sub: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono,
        adminH: usuario.adminH,
        iat: moment().unix(),
        exp: moment().day(10,'days').unix()
    }

    return jwt.encode(payload,secret)
}