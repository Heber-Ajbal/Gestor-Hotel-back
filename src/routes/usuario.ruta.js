'use strict'

var express = require('express')
var usuarioControlador = require('../controller/usuario.controller')


//IMPORTACION DE MIDDLEWARES
var md_autorizacion = require("../middlewares/authenticated");

//RUTAS
var api = express.Router()

api.post('/AgregarAdminH', md_autorizacion.ensureAuth, usuarioControlador.AdminHotel)
api.post('/Registrar',usuarioControlador.Registro)
api.post('/login',usuarioControlador.Login)
api.delete('/EliminarUsuario', md_autorizacion.ensureAuth, usuarioControlador.EliminarUsuario)
api.put('/EditarUsuario', md_autorizacion.ensureAuth, usuarioControlador.EditarUsuario)
api.get('/BuscarUsuario',md_autorizacion.ensureAuth,usuarioControlador.UsuariosRegistrados)
api.get('/ObtenerUsuario',usuarioControlador.ObtenerUsuario)
api.get('/obtenerUsuarioId/:idUsuario', usuarioControlador.obtenerUsuarioID);

module.exports = api
