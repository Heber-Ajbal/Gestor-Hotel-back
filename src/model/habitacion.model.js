'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var HabitacionSchema =Schema ({
    tipodeHabitacion: String,
    cantidad: Number,
    precio: Number,
    estado: String,
    habitacionHotel:{type: Schema.Types.ObjectId, ref:'hoteles'},
    stockReservado: Number

})

module.exports = mongoose.model('habitaciones',HabitacionSchema)