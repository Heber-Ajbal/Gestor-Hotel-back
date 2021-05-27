'use strict'

//VARIABLES GLOBALES 

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')

//IMPORTACION DE RUTAS
var usuario_ruta = require('./src/routes/usuario.ruta');
var hotel_ruta = require('./src/routes/hotel.ruta');
var habitacion_ruta = require('./src/routes/habitacion.ruta')
var evento_ruta = require('./src/routes/evento.ruta');
var reservar_ruta = require('./src/routes/reservacion.rutas')
var servicio_ruta = require('./src/routes/servicio.ruta')
var factura_ruta = require('./src/routes/factura.ruta')
//MIDDLEWARES
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//CABECERA 
app.use(cors())

//APLICACION DE RUTAS 
app.use('/api',usuario_ruta,hotel_ruta,habitacion_ruta,evento_ruta,reservar_ruta,servicio_ruta,factura_ruta)

//EXPORTAR
module.exports = app

