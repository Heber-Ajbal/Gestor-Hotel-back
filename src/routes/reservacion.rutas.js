'use strict';

var express = require('express');
var reservacionController = require('../controller/reservacion.controller')

//MIDDLEWARES
var md_autorizacion = require('../middlewares/authenticated')

//RUTAS
var api = express.Router()
api.post('/Reservar/:id',md_autorizacion.ensureAuth, reservacionController.reservar)
api.get('/VerReservaciones',md_autorizacion.ensureAuth,reservacionController.verReservacion)
api.delete('/CancelarReservacion/:id',md_autorizacion.ensureAuth,reservacionController.CancelarReservacion)
api.get('/ReservacionCliente',md_autorizacion.ensureAuth,reservacionController.verReservacionCliente)
api.get('/obtenerReservacion/:id',md_autorizacion.ensureAuth,reservacionController.obtenerReservacion)

module.exports = api