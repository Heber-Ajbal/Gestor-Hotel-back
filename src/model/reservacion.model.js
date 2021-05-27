'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ReservacionSchema = Schema({
    fechaEntrada: Date,
    fechaSalida: Date,
    cantidad: Number,
    precioHabitacion:Number,
    servicios:[{
        servicioId:{type: Schema.Types.ObjectId, ref:'servicios'} ,
        nombre: String,
        precio: Number
    }],
    
    estado: Boolean,
    habitacionReservada:{type: Schema.Types.ObjectId, ref:'habitaciones'},
    hotelH:String,
    cliente: {type: Schema.Types.ObjectId, ref:'usuarios'}
})

module.exports = mongoose.model('reservaciones', ReservacionSchema)