'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var FacturaSchema = Schema({
    usuario:{type: Schema.Types.ObjectId, ref:'usuarios'},
    reservacion:{type: Schema.Types.ObjectId, ref:'reservaciones'},
    servicios:[{  
        servicioId:{type: Schema.Types.ObjectId, ref:'servicios'} ,
        nombre: String,
        precio:Number
    }],
    hotelHospedado: {type: Schema.Types.ObjectId, ref:'hoteles'},
    habitacioneReservada:{type: Schema.Types.ObjectId, ref:'habitaciones'},
    precioHabitacion : Number,
    total: Number

})

module.exports = mongoose.model('facturas', FacturaSchema)