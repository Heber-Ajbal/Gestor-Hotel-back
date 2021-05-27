'use strict'


var Habitacion = require("../model/habitacion.model")
var Hotel = require("../model/hotel.model")
var Usuario = require("../model/usuario.model")


function agregarHabitacion(req, res) {

    var habitacionModel = new Habitacion()
    var params = req.body

    if (req.user.rol = ! 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar una habitacion' })
    }

    Hotel.findOne().sort({ $natural: -1 }).limit(1).exec((err, HotelEncontrado) => {


        var idHotel = HotelEncontrado._id
        Habitacion.find({ tipodeHabitacion: params.tipodeHabitacion, habitacionHotel: idHotel }).exec((err, HabitacionEncontrada) => {

            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (HabitacionEncontrada.length >= 1) return res.status(500).send({ mensaje: 'La habitacion ya ha sido registrada' })

            if (params.tipodeHabitacion && params.cantidad && params.precio) {

                habitacionModel.tipodeHabitacion = params.tipodeHabitacion,
                    habitacionModel.cantidad = params.cantidad,
                    habitacionModel.precio = params.precio,
                    habitacionModel.estado = 'Disponible',
                    habitacionModel.stockReservado = 0
                habitacionModel.habitacionHotel = idHotel

                habitacionModel.save((err, HabitacionGuardada) => {

                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                    if (HabitacionGuardada) {

                        return res.status(200).send({ HabitacionGuardada })
                    } else {

                        return res.status(500).send({ mensaje: 'Error al guardar la habiracion' })
                    }
                })
            } else {

                return res.status(500).send({ mensaje: 'Ingrese todos los parametros necesarios' })
            }
        })


    });
}

function addHabitacion(req, res) {

    var habitacionModel = new Habitacion()
    var idHotel = req.params.id
    var params = req.body

    if (req.user.rol != 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar una habitacion' })
    }

    Habitacion.find({ tipodeHabitacion: params.tipodeHabitacion, habitacionHotel: idHotel }).exec((err, HabitacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (HabitacionEncontrada.length >= 1) return res.status(500).send({ mensaje: 'La habitacion ya ha sido registrada' })

        if (params.tipodeHabitacion && params.cantidad && params.precio) {

            habitacionModel.tipodeHabitacion = params.tipodeHabitacion,
                habitacionModel.cantidad = params.cantidad,
                habitacionModel.precio = params.precio,
                habitacionModel.estado = 'Disponible',
                habitacionModel.stockReservado = 0
            habitacionModel.habitacionHotel = idHotel

            habitacionModel.save((err, HabitacionGuardada) => {

                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (HabitacionGuardada) {

                    return res.status(200).send({ HabitacionGuardada })
                } else {

                    return res.status(500).send({ mensaje: 'Error al guardar la habitacion' })
                }
            })
        } else {

            return res.status(500).send({ mensaje: 'Ingrese todos los parametros necesarios' })
        }
    })
}

function editarHabitacion(req, res) {

    var idHabitacion = req.params.id
    var params = req.body
    var idhotelHab

    if (req.user.rol != 'ROL_ADMIN') {
        if (req.user.rol != 'ROL_ADMIN_H') {
            return res.status(500).send({ mensaje: 'No posee los permisos para editar Eventos' })
        }
    }

    Habitacion.findById(idHabitacion).exec((err, HabitacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (HabitacionEncontrada) {
            idhotelHab = HabitacionEncontrada.habitacionHotel

        }
        if (!HabitacionEncontrada) {
            return res.status(500).send({ mensaje: 'La habitacion no existe' })
        } else {

            Usuario.findOne({ adminH: idhotelHab }).exec((err, AdminEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (AdminEncontrado) {
                    var idadmin = AdminEncontrado._id

                }
                if (!AdminEncontrado) {
                    return res.status(500).send({ mensaje: 'El administrador no existe' })
                } else {

                    if (idadmin != req.user.sub) {
                        return res.status(500).send({ mensaje: 'No pude editar la habitacion de un Hotel ajeno' })
                    } else {
                        Habitacion.find({ tipodeHabitacion: params.tipodeHabitacion, habitacionHotel: idhotelHab }).exec((err, HabitacionActualizada) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                            if (HabitacionActualizada.length >= 1) {
                                return res.status(500).send({ mensaje: 'La habitacion ya esta registrada ' })
                            } else {
                                Habitacion.findByIdAndUpdate(idHabitacion, params, { new: true }, (err, HabitacionModificada) => {
                                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                                    if (!HabitacionModificada) return res.status(500).send({ mensaje: 'La habitacion no existe' })
                                    if (HabitacionModificada) return res.status(500).send({ HabitacionModificada })
                                })
                            }
                        })
                    }
                }
            })
        }
    })
}

function buscarHabitacion(req, res) {

    var habitacionId = req.params.id

    Habitacion.find({ habitacionHotel: habitacionId }).exec((err, HabitacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (HabitacionEncontrada) {

            return res.status(200).send({ HabitacionEncontrada })
        } else {

            return res.status(500).send({ mensaje: 'las habitaciones no existen' })
        }
    })
}

function buscarHabitacionID(req, res) {

    var habitacionId = req.params.id

    Habitacion.find({ _id: habitacionId }).exec((err, HabitacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (HabitacionEncontrada) {

            return res.status(200).send({ HabitacionEncontrada })
        } else {

            return res.status(500).send({ mensaje: 'las habitaciones no existen' })
        }
    })
}

function HabitacionesDisponibles(req, res) {

    var idHotel = req.user.adminH
    var suma = 0

    if (req.user.rol != 'ROL_ADMIN_H') {

        return res.status(500).send({ mensaje: 'No posee el permiso de ver las Habitaciones Disponibles' })
    }

    Habitacion.find({ habitacionHotel: idHotel }, { _id: 0, habitacionHotel: 0, precio: 0, __v: 0 }).exec((err, HabitacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion}' })
        if (HabitacionEncontrada.length <= 0) {

            return res.status(500).send({ mensaje: 'No se han agregado las habitaciones' })
        } else {

            var arrayStocks = HabitacionEncontrada
            arrayStocks.forEach(function (elemento) {

                suma += elemento.cantidad

            })

            return res.status(200).send({ HabitacionEncontrada })
        }
    })


}

function Reporte(req, res) {

    var idHotel = req.params.id

    if (req.user.rol = ! 'ROL_ADMIN') {
        return res.status(500).send({ mensaje: 'No posee los permisos para ver los reportes' })
    }

    Habitacion.find({ habitacionHotel: idHotel }).sort({ stockReservado: -1 }).populate('habitacionHotel', 'nombre').exec((err, HabitacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!HabitacionEncontrada) return res.status(500).send({ mensaje: 'No se han registrado habitaciones' })

        return res.status(200).send({ HabitacionEncontrada })
    })
}

module.exports = {
    agregarHabitacion,
    buscarHabitacion,
    HabitacionesDisponibles,
    editarHabitacion,
    buscarHabitacionID,
    Reporte,
    addHabitacion
}