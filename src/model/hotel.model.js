'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var HotelSchema = Schema({

    nombre:String,
    descripcion:String,
    direccion:String,
    imagen:String,
    estadisticas: Number

})

module.exports = mongoose.model('hoteles', HotelSchema)