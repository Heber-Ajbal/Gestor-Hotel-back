'use strict'

var express = require('express')
var facturaController = require('../controller/factura.controller')

//MIDDLEWARE
var md_autorizacion =require('../middlewares/authenticated')

//RUTAS
var api = express.Router()

api.get('/Facturar/:id', md_autorizacion.ensureAuth, facturaController.FacturarReservacion)
api.get('/VerFactura',md_autorizacion.ensureAuth,facturaController.VerFactura )
api.get('/VerFacturaAdmin/:id', md_autorizacion.ensureAuth, facturaController.VerFacturaAdmin)

module.exports = api