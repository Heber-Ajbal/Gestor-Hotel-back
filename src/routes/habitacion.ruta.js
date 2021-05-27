'use strict'

var express = require('express')
var habitacionController = require('../controller/habitacion.controller');

//MIDDLEWARES
var md_autorizacion = require('../middlewares/authenticated')

//RUTAS
var api = express.Router()
api.post('/AgregarHabitacion',md_autorizacion.ensureAuth,habitacionController.agregarHabitacion)
api.get('/BuscarHabitacion/:id', habitacionController.buscarHabitacion)
api.get('/HabitacionesDisponibles',md_autorizacion.ensureAuth, habitacionController.HabitacionesDisponibles)
api.put('/EditarHabitacion/:id', md_autorizacion.ensureAuth, habitacionController.editarHabitacion)
api.get('/buscarHabitacionID/:id', md_autorizacion.ensureAuth, habitacionController.buscarHabitacionID)
api.get('/MostrarReporte/:id', md_autorizacion.ensureAuth, habitacionController.Reporte)
api.post('/addHabitacion/:id', md_autorizacion.ensureAuth, habitacionController.addHabitacion)

module.exports = api