'use strict'

var Hotel = require("../model/hotel.model")
var Reservacion = require("../model/reservacion.model")
var Usuario = require("../model/usuario.model")
var Habitacion = require("../model/habitacion.model")
var Servicios = require("../model/servicio.model")
var Eventos = require("../model/evento.model")
var moment = require("moment")
var fechaActual = new Date()


function AgregarHotel(req, res) {

    var hotelModel = new Hotel();
    var params = req.body;


    if (req.user.rol != 'ROL_ADMIN') {

        return res.status(500).send({ mensaje: 'No posee los permisos para agregar un hotel' })
    }

    if (params.nombre && params.descripcion && params.direccion) {

        hotelModel.nombre = params.nombre,
            hotelModel.descripcion = params.descripcion,
            hotelModel.direccion = params.direccion,
            hotelModel.imagen = null,
            hotelModel.estadisticas = 0

        Hotel.find({ nombre: params.nombre }).exec((err, HotelEncontrado) => {

            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (HotelEncontrado.length >= 1) {

                return res.status(500).send({ mensaje: 'El nombre del Hotel ya existe' })
            } else {

                hotelModel.save((err, HotelGuardado) => {

                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion del hotel' })

                    if (HotelGuardado) {

                        return res.status(200).send(HotelGuardado)
                    } else {

                        return res.status(500).send({ mensaje: 'Error al guardar el hotel ' })
                    }
                })
            }
        })
    } else {

        return res.status(500).send({ mensaje: 'Debe ingresar todos los parametros necesarios' })
    }
}

function EditarHotel(req, res) {
    var idHotel = req.params.id
    var params = req.body

    if (req.user.rol != 'ROL_ADMIN') {

    }

    Hotel.find({ nombre: params.nombre }).exec((err, HotelEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })

        Hotel.findById(idHotel).exec((err, hotelEncontrado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!hotelEncontrado) return res.status(500).send({ mensaje: 'El hotel no existe' })

            if (req.user.rol === 'ROL_ADMIN') {
                Hotel.findByIdAndUpdate(idHotel, params, { new: true }, ((err, HotelActualizado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                    if (!HotelActualizado) return res.status(500).send({ mensaje: 'El Hotel no esta registrado' })
                    return res.status(200).send({ HotelActualizado })
                }))
            }

        })

    })
}

function BuscarHoteles(req, res) {

    var params = req.body

    if (params.nombre) {

        Hotel.findOne({ nombre: params.nombre }).exec((err, HotelEncontrado) => {

            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (HotelEncontrado) {

                return res.status(500).send({ HotelEncontrado })
            } else {

                return res.status(500).send({ mensaje: 'El hotel no existe' })
            }
        })
    } else {
        return res.status(500).send({ mensaje: 'Ingrese los parametros necesarios' })
    }
}

function buscarHotelID(req, res) {

    var idHotel = req.params.id


    Hotel.findById(idHotel, (err, HotelEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!HotelEncontrado) return res.status(500).send({ mensaje: 'El Hotel no existe' })
        return res.status(200).send({ HotelEncontrado })
    })
}

function eliminarHotel(req, res) {

   var idHotel = req.params.id

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos de eliminar' })
    }

    Hotel.findByIdAndDelete(idHotel, (err, HotelEliminado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!HotelEliminado) {

            return res.status(500).send({ mensaje: 'Error al eliminar' })
        } else {

            //ELIMINAR LAS HABITACIONES 
            Habitacion.deleteMany({ habitacionHotel: idHotel }, { multi: true }, (err, HabitacionEliminada) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (!HabitacionEliminada) return res.status(500).send({ mensaje: 'Error al eliminar' })

                //ELIMINAR LOS SERVICIOS 

                Servicios.deleteMany({ hotelServicio: idHotel }, { multi: true }, (err, ServicioEliminado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                    if (!ServicioEliminado) return res.status(500).send({ mensaje: 'Error al eliminar' })

                    //ELIMINAR LOS EVENTOS

                    Eventos.deleteMany({ hotelevento: idHotel }, { multi: true }, (err, EventoEliminado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (!EventoEliminado) return res.status(500).send({ mensaje: 'Error al eliminar' })

                        //ELIMINAR LOS ADMIN HOTEL

                        Usuario.deleteMany({ adminH: idHotel }, { multi: true }, (err, AdminEliminado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                            if (!AdminEliminado) return res.status(500).send({ mensaje: 'Error al eliminar' })

                            //ACTUALIZAR LA RESERVACION

                            Reservacion.update({ hotelH: idHotel }, {
                                $set: {

                                    hotelH: " EL HOTEL SE HA ELIMINADO, Y SU RESERVACION FUE CANCELADA"


                                }
                            }, { multi: true }, (err, ReservacionAct) => {
                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                                if (!ReservacionAct) return res.status(500).send({ mensaje: 'Error al eliminar' })

                                return res.status(200).send({HotelEliminado})
                            })
                        })
                    })
                })
            })
        }
    })
}

function BuscarHotelDireccion(req, res) {

    var params = req.body

    Hotel.findOne({ direccion: params.direccion }, { estadisticas: 0 }).exec((err, HotelEncontrado) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (HotelEncontrado) {

            return res.status(200).send({ HotelEncontrado })
        } else {

            return res.status(500).send({ mensaje: 'Error al buscar el hotel' })
        }
    })
}

function MostrarHoteles(req, res) {

    Hotel.find({ estadisticas: 0 }).exec((err, HotelEncontrado) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion ' })
        if (HotelEncontrado) {

            return res.status(200).send({ HotelEncontrado })
        } else {
            return res.status(500).send({ mensaje: 'No se han registrado los hoteles' })
        }
    })
}

function usuariosHospedados(req, res) {

    var idhotelHabitacion = req.user.adminH
    var params = req.body
    if (req.user.rol != 'ROL_ADMIN_H') {
        return res.status(500).send({ mensaje: 'No posee los permisos para buscar a un huesped' })
    }

    if (params.nombre) {

        Usuario.find({ nombre: params.nombre }).exec((err, UsuarioEncontrado) => {

            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!UsuarioEncontrado) return res.status(500).send({ mensaje: 'El usuario no existe' })
            var idHuesped = UsuarioEncontrado._id

            Reservacion.find({

                $and: [

                    { cliente: idHuesped },
                    { hotelH: idhotelHabitacion }
                ]
            }).exec((err, ReservacionEncontrada) => {

                if (err) return res.status(500).send({ mensaje: 'error en la peticion' })
                if (ReservacionEncontrada) {

                    return res.status(200).send({ ReservacionEncontrada })
                } else {

                    return res.status(500).send({ mensaje: 'El usuario no esta hospedado en su hotel' })
                }
            })
        })
    } else {

        return res.status(500).send({ mensaje: 'Agregue los parametros necesarios' })
    }


}


// MOSTRAR USUARIOS HOSPEDADOS

function mostrarUsuariosHoespedados(req, res) {

    var idHotel = req.user.adminH

    Reservacion.find({ hotelH: idHotel, fechaSalida: { $gt: fechaActual } }).populate('cliente', 'nombre').exec((err, huespedEncontrado) => {


        return res.status(200).send({ huespedEncontrado })
    })

}


function obtenerHoteles(req, res) {
    Hotel.find().exec((err, HotelEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!HotelEncontrado) return res.status(500).send({ mensaje: 'Aun no se han añadido hoteles' })
        return res.status(200).send({ HotelEncontrado })
    })
}

function Estadisticas(req, res) {
    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee el permiso de ver las estadisticas ' })
    }

    Hotel.find({

        estadisticas: { $gt: 1 }
    }).sort({ estadisticas: 1 }).limit(5).exec((err, HotelesEncontrados) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (HotelesEncontrados) {
            return res.status(200).send({ HotelesEncontrados })
        } else {
            return res.status(500).send({ mensaje: 'Aun no se han hecho reservaciones en los hoteles' })
        }
    })
}

module.exports = {
    AgregarHotel,
    BuscarHoteles,
    BuscarHotelDireccion,
    MostrarHoteles,
    usuariosHospedados,
    EditarHotel,
    obtenerHoteles,
    mostrarUsuariosHoespedados,
    Estadisticas,
    buscarHotelID,
    eliminarHotel
}