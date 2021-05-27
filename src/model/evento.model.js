'use strict'

var mongoose = require("mongoose")
var Schema = mongoose.Schema

var EventoSchema = Schema({

    nombre: String,
    tipoEvento: String,
    fecha: Date,
    hotelevento:{type: Schema.Types.ObjectId, ref:'hoteles'},
    imagen:String,
})

module.exports = mongoose.model('eventos', EventoSchema)

