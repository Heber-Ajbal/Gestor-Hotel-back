'use strict'

var Reservacion = require("../model/reservacion.model")
var Habitacion = require("../model/habitacion.model")
var Servicio = require("../model/servicio.model")
var Hotel = require("../model/hotel.model")
var fechaActual = new Date()

function reservar(req, res) {
    var habitacionModel = new Habitacion()
    var reservacionModel = new Reservacion()
    var idHabitacion = req.params.id
    var params = req.body
    var stockHab
    var stockReservacion;
    var cantidadHab

    Habitacion.findOne({ _id: idHabitacion }).exec((err, HabitacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion 1' })
        if (!HabitacionEncontrada) return res.status(500).send({ mensaje: 'La habitacion no existe' })
        var habitacionHotel = HabitacionEncontrada.habitacionHotel
        var idhab = HabitacionEncontrada._id
        var precioHabitacion = HabitacionEncontrada.precio
        stockHab = HabitacionEncontrada.cantidad
        stockReservacion = HabitacionEncontrada.stockReservado
        cantidadHab = params.cantidad
        var estadoHab = HabitacionEncontrada.estado

        console.log(habitacionHotel)

        Servicio.findOne({ nombre: params.nombre, hotelServicio: habitacionHotel }).exec((err, ServicioEncontrado) => {
            console.log(ServicioEncontrado)
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!ServicioEncontrado) {
                var idSer = null
                var nombreSer = null
                // return res.status(500).send({mensaje:'El servicio no existe'})
            } else {
                var idSer = ServicioEncontrado._id
                var nombreSer = ServicioEncontrado.nombre
                var precioSer = ServicioEncontrado.precio
            }


            

            if (params.fechaEntrada && params.fechaSalida && params.cantidad) {

                reservacionModel.fechaEntrada = params.fechaEntrada,
                    reservacionModel.fechaSalida = params.fechaSalida,
                    reservacionModel.cantidad = params.cantidad,
                    reservacionModel.precioHabitacion = precioHabitacion,
                    reservacionModel.servicios = {

                        servicioId: idSer,
                        nombre: nombreSer,
                        precio: precioSer
                    }
                reservacionModel.estado = false
                reservacionModel.habitacionReservada = idHabitacion
                reservacionModel.hotelH = habitacionHotel
                reservacionModel.cliente = req.user.sub

                

                if (stockHab < cantidadHab) {
                    return res.status(500).send({ mensaje: `La cantidad de habitaciones disponibles es de: ${stockHab}` })

                }




                reservacionModel.save((err, ReservacionGurdada) => {
                    console.log(stockReservacion)
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                    if (ReservacionGurdada) {

                        //BUSCAR EL HOTEL Y ACTUALIZAR LAS ESTADISTICAS 

                        Hotel.findById(habitacionHotel, (err, HotelEncontrado) => {

                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                            if (!HotelEncontrado) return res.status(500).send({ mensaje: 'El hotel no existe' })

                            var estadistica = HotelEncontrado.estadisticas


                            //BUSCAR EL HOTEL Y ACTUALIZAR LAS ESTADISTICAS 

                            /// AUMENTAR EL STOCK DE RESERVACION Y RESTAR EL STOCK DE HABITACION
                            var totalHab = stockHab - params.cantidad;
                            var totalReser = parseInt(stockReservacion) + parseInt(params.cantidad)
                            Habitacion.update({ _id: idhab }, {

                                $set: {

                                    cantidad: totalHab,
                                    stockReservado: totalReser
                                }
                            }, { new: true }, (err, StockActualizado) => {

                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                                if (!StockActualizado) return res.status(500).send({ mensaje: 'No se pudo actualizar el stock' })
                                if (StockActualizado) {

                                    var totalEstadistica = parseInt(estadistica) + parseInt(params.cantidad)
                                    Hotel.update({ _id: habitacionHotel }, {
                                        $set: {

                                            estadisticas: totalEstadistica
                                        }
                                    }, { new: true }, (err, EstadisticaActualizado) => {

                                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de la estadistica' })
                                        if (!EstadisticaActualizado) return res.status(500).send({ mensaje: 'No se pudo actualizar la estadistica' })
                                        return res.status(200).send({ ReservacionGurdada })
                                    })

                                }

                            })

                        })
                    } else {

                        return res.status(500).send({ mensaje: 'Error al guardar la reservacion' })
                    }
                })
            } else {

                return res.status(500).send({ mensaje: 'Agregue todos los parametros necesarios ' })
            }
        })
    })


}

function verReservacion(req, res) {

    var idHotel = req.user.adminH

    Reservacion.find({ hotelH: idHotel }).populate('cliente', 'nombre _id').populate(
        'habitacionReservada', 'tipodeHabitacion'

    ).exec((err, ReservacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (ReservacionEncontrada.length <= 0) {

            return res.status(500).send({ mensaje: 'No se han hecho reservaciones' })
        } else {

            return res.status(200).send({ ReservacionEncontrada })
        }
    })

}

function CancelarReservacion(req, res) {

    var idcliente = req.user.sub
    var idReservacion = req.params.id
    var idHabitacion;
    var stockHab;
    var stockRes;


    if (req.user.rol != 'ROL_CLIENTE') {

        return res.status(500).send({ mensaje: 'No posee el permiso de cancelar la reservacion' })
    }

    Reservacion.findById(idReservacion, (err, ReservacionEncontrada) => {



        if (err) return res.status(500).send({ mensaje: 'Error buscar la habitacion reservada' })
        if (!ReservacionEncontrada) return res.status(500).send({ mensaje: 'La Reservacion no existe' })
        if (ReservacionEncontrada.cliente != idcliente) return res.status(500).send({ mensaje: 'No puede ver la reservacion' })
        idHabitacion = ReservacionEncontrada.habitacionReservada
        var idHotel = ReservacionEncontrada.hotelH
        var cantidadStockR = ReservacionEncontrada.cantidad

        Habitacion.findOne({ _id: idHabitacion }).exec((err, HabitacionEncontrada) => {

            var cantidadHabitacion = HabitacionEncontrada.cantidad
            var reservaEncontrada = HabitacionEncontrada.stockReservado
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (!HabitacionEncontrada) return res.status(500).send({ mensaje: 'La habitacion no Existe' })



            Hotel.findById(idHotel, (err, HotelEncontrado) => {

                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (!HotelEncontrado) return res.status(500).send({ mensaje: 'El hotel no existe' })

                var estadistica = HotelEncontrado.estadisticas

                //SUMAR ES STOCK DE HABITACION Y RESTAR EL STOCK DE RESERVA
                stockHab = parseInt(cantidadHabitacion) + parseInt(cantidadStockR)
                stockRes = reservaEncontrada - cantidadStockR
                Habitacion.update({ _id: idHabitacion }, {
                    $set: {
                        cantidad: stockHab,
                        stockReservado: stockRes,
                    }
                }, { new: true }, (err, StockActualizado) => {

                    if (err) return res.status(500).send({ mensaje: 'Error en Actualizar el stock' })
                    if (!StockActualizado) return res.status(500).send({ mensaje: 'No se han encontrado los datos' })

                    Reservacion.findByIdAndDelete(idReservacion, (err, ReservacionCancelada) => {

                        if (err) return res.status(500).send({ mensaje: 'Error al cancelar la Reservacion' })
                        if (!ReservacionCancelada) return res.status(500).send({ mensaje: 'No se encontradon datos' })

                        if (ReservacionCancelada) {

                            var totalEstadistica = parseInt(estadistica) - parseInt(cantidadStockR)
                            Hotel.update({ _id: idHotel }, {
                                $set: {

                                    estadisticas: totalEstadistica
                                }
                            }, { new: true }, (err, EstadisticaActualizado) => {

                                if (err) return res.status(500).send({ mensaje: 'Error en la peticion de la estadistica' })
                                if (!EstadisticaActualizado) return res.status(500).send({ mensaje: 'No se pudo actualizar la estadistica' })
                                return res.status(200).send({ ReservacionCancelada })
                            })

                        }

                    })
                })
            })
        })
    })
}

function verReservacionCliente(req, res) {

    var idHotel = req.user.sub

    Reservacion.find({ cliente: idHotel, fechaSalida: { $gt: fechaActual } }).populate('cliente', 'nombre ').populate(
        'habitacionReservada', 'tipodeHabitacion'

    ).exec((err, ReservacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (ReservacionEncontrada.length <= 0) {

            return res.status(500).send({ mensaje: 'No se han hecho reservaciones' })
        } else {

            return res.status(200).send({ ReservacionEncontrada })
        }
    })

}

function obtenerReservacion(req, res) {

    var idReservacion = req.params.id

    Reservacion.findById(idReservacion).exec((err, ReservacionEncontrada) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!ReservacionEncontrada) return res.status(500).send({ mensaje: 'No existe la reservacion' })
        return res.status(200).send({ ReservacionEncontrada })
    })
}


module.exports = {

    reservar,
    verReservacion,
    CancelarReservacion,
    verReservacionCliente,
    obtenerReservacion

}

