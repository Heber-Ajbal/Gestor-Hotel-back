'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var UsuarioSchema = Schema({

    nombre: String,
    email: String,
    password: String,
    rol: String,
    telefono: String,
    imagen:String,
    historial:[],
    adminH:{type: Schema.Types.ObjectId, ref:'hoteles'}
})

module.exports = mongoose.model('usuarios',UsuarioSchema);