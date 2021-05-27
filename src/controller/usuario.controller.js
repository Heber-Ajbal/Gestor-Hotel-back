'use strict';

var Usuario = require('../model/usuario.model');
var Hotel = require('../model/hotel.model')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');



function Admin(req, res) {

    var userModel = new Usuario();

    userModel.nombre = 'ADMIN',
        userModel.email = 'admin@gmail.com'
    userModel.password = '123456',
        userModel.rol = 'ROL_ADMIN'

    Usuario.find({ nombre: userModel.nombre }).exec((err, AdminEncontrado) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (AdminEncontrado.length >= 1) {

            return console.log('El admin ya se ha creado')
        } else {

            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {

                userModel.password = passwordEncriptada;
                userModel.save((err, adminGuardado) => {

                    if (err) return console.log('Error en la peticion del admin')
                    if (adminGuardado) {

                        return console.log('Admin creado exitosamente')
                    } else {

                        return console.log('error al crear al Admin')
                    }
                });
            })
        }
    })
}

function AdminHotel(req, res) {
    var userModel = new Usuario()
    var params = req.body;
    var idHotel;

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar un administrador' })
    }

    Hotel.findOne().sort({ $natural: -1 }).limit(1).exec((err, hotelEncontrado) => {

        idHotel = hotelEncontrado._id
        if (params.nombre && params.email && params.password) {

            userModel.nombre = params.nombre,
                userModel.email = params.email,
                userModel.rol = 'ROL_ADMIN_H'
            userModel.adminH = idHotel

            Usuario.find({

                $or: [

                    { nombre: userModel.nombre },
                    { email: userModel.email }
                ]

            }).exec((err, UsuarioEncontrado) => {

                if (err) return res.status(500).send({ mensaje: 'Error en la peticion de usuarios' })
                if (UsuarioEncontrado && UsuarioEncontrado.length >= 1) {

                    return res.status(500).send({ mensaje: 'El usuario ya existe' })
                } else {

                    bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {

                        userModel.password = passwordEncriptada;
                        userModel.save((err, UsuarioCreado) => {

                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de guardar el usuario' })
                            if (UsuarioCreado) {

                                return res.status(200).send({ UsuarioCreado })
                            } else {

                                return res.status(500).send({ mensaje: 'Error al crear el Usuario' })
                            }
                        })
                    })
                }
            })
        } else {

            return res.status(500).send({ mensaje: 'Ingrese todos los parametros necesarios' })
        }

    })
}

// "and" para que se puedan repetir los datos en los distintos roles.
function Registro(req, res) {
    var userModel = new Usuario()
    var params = req.body;

    if (params.nombre && params.email && params.password) {

        userModel.nombre = params.nombre,
            userModel.email = params.email,
            userModel.rol = 'ROL_CLIENTE',
            userModel.telfono = null;
        userModel.imagen = null;
        userModel.historial = []

        Usuario.find({

            $or: [

                { nombre: userModel.nombre },
                { email: userModel.email }
            ]

        }).exec((err, UsuarioEncontrado) => {

            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de usuarios' })
            if (UsuarioEncontrado && UsuarioEncontrado.length >= 1) {

                return res.status(500).send({ mensaje: 'El usuario ya existe' })
            } else {

                bcrypt.hash(params.password, null, null, (err, passwordEncriptada) => {

                    userModel.password = passwordEncriptada;
                    userModel.save((err, UsuarioCreado) => {

                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de guardar el usuario' })
                        if (UsuarioCreado) {

                            return res.status(200).send({ UsuarioCreado })
                        } else {

                            return res.status(500).send({ mensaje: 'Error al crear el Usuario' })
                        }
                    })
                })
            }
        })
    } else {

        return res.status(500).send({ mensaje: 'Ingrese todos los parametros necesarios' })
    }
}

function Login(req, res) {

    var params = req.body;

    if (params.email && params.password) {
        Usuario.findOne({ email: params.email }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });

            if (usuarioEncontrado) {
                bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerificada) => {
                    if (passVerificada) {
                        if (params.getToken === 'true') {
                            return res.status(200).send({
                                token: jwt.createToken(usuarioEncontrado)
                            })

                        } else {
                            usuarioEncontrado.password = undefined;
                            return res.status(200).send({ usuarioEncontrado });
                        }
                    } else {
                        return res.status(500).send({ mensaje: 'La contraseña que ingresaste es incorrecta.' })
                    }
                })
            } else {
                return res.status(500).send({ mensaje: 'El usuario no esta registrado' })
            }
        })
    } else {
        return res.status(500).send({ mensaje: 'Llene todos los parametros' })
    }
}


function EliminarUsuario(req, res) {

    var idUsuario = req.user.sub
    Usuario.findByIdAndDelete(idUsuario, (err, UsuarioEliminado) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (UsuarioEliminado) {

            return res.status(500).send({ UsuarioEliminado })
        } else {

            return res.status(500).send({ mensaje: 'Error al eliminar el usuario' })
        }
    })
}

function EditarUsuario(req, res) {
    var idUsuario = req.user.sub
    var params = req.body
    delete params.password
    delete params.rol

    if (idUsuario != req.user.sub) {
        return res.status(500).send({ mensaje: 'No posee los permisos para editar ese usuario' });
    }

    Usuario.find({
        $or: [
            { nombre: params.nombre },
            { email: params.email }
        ]
    }).exec((err, UsuarioEncontrado) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (UsuarioEncontrado && UsuarioEncontrado.length >= 1) {

            return res.status(500).send({ mensaje: 'El nombre o email al que desea actualizar ya existe' })
        } else {

            Usuario.findByIdAndUpdate(idUsuario, params, { new: true }, (err, usuarioActualizado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion0' })
                if (!usuarioActualizado) return res.status(500).send({ mensaje: 'no se a podido editar el usuario' })

                return res.status(200).send({ usuarioActualizado })

            })
        }
    })



}

function UsuariosRegistrados(req, res) {

    if (req.user.rol != 'ROL_ADMIN') {

        return res.status(500).send('no posee los permisos para ver todos los usuarios registrados')
    }

    Usuario.find().exec((err, usuarios) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (usuarios) {

            return res.status(200).send({ usuarios })
        } else {

            return res.status(500).send({ mensaje: 'Error al buscar los usuarios' })
        }
    })
}

function ObtenerUsuario(req, res) {


    Usuario.find().exec((err, usuarios) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (usuarios) {

            return res.status(200).send({ usuarios })
        } else {

            return res.status(500).send({ mensaje: 'Error al buscar los usuarios' })
        }
    })
}

function obtenerUsuarioID(req, res) {
    var usuarioId = req.params.idUsuario;

    Usuario.findById(usuarioId, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de Usuario' });
        if (!usuarioEncontrado) return res.status(500).send({ mensaje: 'Error al obtener el Usuario.' });
        return res.status(200).send({ usuarioEncontrado });
    })
}




module.exports = {
    Admin,
    AdminHotel,
    Registro,
    Login,
    EliminarUsuario,
    EditarUsuario,
    UsuariosRegistrados,
    ObtenerUsuario,
    obtenerUsuarioID
}
