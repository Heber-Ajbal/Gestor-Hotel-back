'use strict'

var express = require('express')
var eventocontroller = require('../controller/evento.controller')

//MIDDLEWARE
var md_autorizacion =require('../middlewares/authenticated')

//RUTAS
var api = express.Router()
api.get('/BuscarEventos/:idEven', eventocontroller.buscarEventos)
api.post('/agregarEvento/:id',md_autorizacion.ensureAuth,eventocontroller.AgregarEvento)
api.get('/BuscarEvento/:id',md_autorizacion.ensureAuth, eventocontroller.VerEvento)
api.put('/EditarEvento/:id',md_autorizacion.ensureAuth, eventocontroller.EditarEvento)
api.delete('/EliminarEvento/:id',md_autorizacion.ensureAuth, eventocontroller.EliminarEvento)
api.post('/agregarEventoH',md_autorizacion.ensureAuth,eventocontroller.agregarEventoH)


module.exports = api