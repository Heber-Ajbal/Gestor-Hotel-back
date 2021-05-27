'use strict'

var express = require('express');
var servicioController = require('../controller/servicio.controller')

//MIDDLEWARES
var md_autorizacion = require('../middlewares/authenticated')

//RUTAS

var api = express.Router()

api.post('/AgregarServicio', md_autorizacion.ensureAuth,servicioController.AgregarServicio)
api.put('/actualizarServicio', servicioController.actualizarServicio)
api.post('/addServicio/:id', md_autorizacion.ensureAuth, servicioController.addServicio)
api.get('/servicios/:id' ,servicioController.servicioID)

module.exports = api