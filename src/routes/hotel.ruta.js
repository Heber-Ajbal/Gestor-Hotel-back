'use strict'

var express = require('express')
var hotelcontrolador = require('../controller/hotel.controller')

//MIDDLEWARES
var md_autorizacion = require('../middlewares/authenticated')

//RUTAS
var api = express.Router();

api.post('/AgregarHotel', md_autorizacion.ensureAuth,hotelcontrolador.AgregarHotel)
api.get('/BuscarHotel', hotelcontrolador.BuscarHoteles)
api.get('/BuscarHotelDireccion', hotelcontrolador.BuscarHotelDireccion)
api.get('/MostrarHoteles',hotelcontrolador.MostrarHoteles)
api.get('/UsuarioHospedado', md_autorizacion.ensureAuth, hotelcontrolador.usuariosHospedados)
api.put('/EditarHotel/:id',md_autorizacion.ensureAuth, hotelcontrolador.EditarHotel)
api.get('/obtenerHoteles',hotelcontrolador.obtenerHoteles)
api.get('/BuscarHotelID/:id', md_autorizacion.ensureAuth, hotelcontrolador.buscarHotelID)
api.get('/huesped',md_autorizacion.ensureAuth ,hotelcontrolador.mostrarUsuariosHoespedados)
api.get('/Estadisticas',md_autorizacion.ensureAuth ,hotelcontrolador.Estadisticas)
api.delete('/EliminarHot/:id', md_autorizacion.ensureAuth, hotelcontrolador.eliminarHotel)
module.exports = api