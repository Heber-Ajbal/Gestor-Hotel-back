'use strict'

var Reservacion = require('../model/reservacion.model')
var Habitacion = require('../model/habitacion.model')
var Factura = require('../model/factura.model')
var Usuario = require('../model/usuario.model')

function FacturarReservacion(req, res) {
    var idReservacion = req.params.id
    var facturaModel = new Factura();
    var FechaActual = new Date()
    var totalServicios = 0


    if(req.user.rol != 'ROL_ADMIN_H'){
        return res.status(500).send({ mensaje: 'no posee los permisos'})
    }

    Reservacion.findById(idReservacion, (err, ReservacionEncontrada) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (ReservacionEncontrada) {


            var ClienteID = ReservacionEncontrada.cliente
            var HotelID = ReservacionEncontrada.hotelH
            var HabitacionID = ReservacionEncontrada.habitacionReservada
            var FechaLlegada = ReservacionEncontrada.fechaEntrada
            var FechaSalida = ReservacionEncontrada.fechaSalida
            var estado = ReservacionEncontrada.estado
            var cantidad = ReservacionEncontrada.cantidad
            var precio = ReservacionEncontrada.precioHabitacion
            var servicios = ReservacionEncontrada.servicios
        }

        if (!ReservacionEncontrada) {

            return res.status(500).send({ mensaje: 'La reservacion no existe' })
        } else {

            //obtener los precios de los servicios del cliente
            servicios.forEach(function (precioServicio) {

                totalServicios += precioServicio.precio
            })

            Habitacion.findById(HabitacionID, (err, HabitacionEncontrada) => {

                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (HabitacionEncontrada) {
                    var stockHab = HabitacionEncontrada.cantidad


                    //COMPARAR SI SU RESERVACION YA TERMINO
                    if (FechaSalida > FechaActual) {
                        return res.status(500).send({ mensaje: 'Aun no puede Facturar, espere a que su hospedaje del cliente termine' })
                    }

                    if (estado != false) {
                        return res.status(500).send({ mensaje: 'La reservacion ya se ha facturado' })
                    }

                    //AGREGAR FACTURAR

                    var fechaLle = new Date(FechaLlegada)
                    var fechaSa = new Date(FechaSalida)
                    var dias = fechaSa.getTime() - fechaLle.getTime();
                    var diasHospedados = Math.round(dias / (1000 * 60 * 60 * 24));
                    var costos = ((diasHospedados * precio) + (diasHospedados * totalServicios))

                    facturaModel.usuario = ClienteID;
                    facturaModel.reservacion = idReservacion;
                    facturaModel.servicios = servicios;
                    facturaModel.hotelHospedado = HotelID;
                    facturaModel.habitacioneReservada = HabitacionID;
                    facturaModel.precioHabitacion = precio;
                    facturaModel.total = costos

                    facturaModel.save((err, FacturaGuardada) => {
                        if (err) return res.status(500).send({ mensaje: 'error en la peticion de facturar' })
                        if (!FacturaGuardada) return res.status(500).send({ mensaje: 'Error al guardar la facturado' })
                        if (FacturaGuardada) {

                            //ACTURALIZAR LA HABITACION 
                            var totalHab = parseInt(stockHab) + parseInt(cantidad)
                            Habitacion.update({ _id: HabitacionID },
                                {
                                    $set: {

                                        cantidad: totalHab
                                    }
                                }, { new: true }, (err, StockActualizado) => {

                                    if (err) return res.status(500).send({ mensaje: 'Error al actualizar el stock de las habitaciones' })
                                    if (!StockActualizado) {

                                        return res.status(500).send({ mensaje: 'no se actualizo el stock' })
                                    } else {

                                        //ACTUALIZAR EL ESTADO DE  FACTURACION DE LA RESERVACION
                                        Reservacion.update({ _id: idReservacion }, {

                                            $set: {
                                                estado: true
                                            }
                                        }, { new: true }, (err, ReservacionActualizada) => {
                                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion de facturar al cliente ' })
                                            if (!ReservacionActualizada) {
                                                return res.status(500).send({ mensaje: 'No se ha actualizado la reservacion' })
                                            } else {

                                                //ACTUALIZAR EL HISTORIAL DEL USUARIO

                                                Usuario.update({ _id: ClienteID }, {

                                                    $push: {
                                                        historial: FacturaGuardada
                                                    }
                                                }, { new: true }, (err, UsuarioActualizado) => {
                                                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                                                    if (!UsuarioActualizado) return res.status({ mensaje: 'no se pudo actualizar' })
                                                    return res.status(200).send({ FacturaGuardada })
                                                })


                                            }

                                        })
                                    }

                                })
                        }
                    })
                }
            })
        }
    })
}

function VerFactura(req,res){

    var idCliente = req.user.sub

    Factura.find({usuario: idCliente}).populate('hotelHospedado','nombre').populate('habitacioneReservada', 'tipodeHabitacion'
    ).populate('reservacion').exec((err,FacturaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if(!FacturaEncontrada) return res.status(500).send({ mensaje: 'no tiene ninguna Factura' })
        return res.status(200).send({FacturaEncontrada})
    })
}

function VerFacturaAdmin(req,res){

    var idCliente = req.params.id;

    Factura.findOne({usuario: idCliente}).populate('hotelHospedado','nombre').populate('habitacioneReservada', 'tipodeHabitacion'
    ).populate('usuario', 'nombre email').populate('reservacion', 'fechaSalida cantidad').exec((err,FacturaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if(!FacturaEncontrada) return res.status(500).send({ mensaje: 'no tiene ninguna Factura' })
        return res.status(200).send({FacturaEncontrada})
    })
}
module.exports = {

    FacturarReservacion,
    VerFactura,
    VerFacturaAdmin
}