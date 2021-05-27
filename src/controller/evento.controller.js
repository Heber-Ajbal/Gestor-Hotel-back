'use strict'

var Evento = require("../model/evento.model")
var Hotel = require("../model/hotel.model")
var Usuario = require("../model/usuario.model")

//CRUD EVENTO


function agregarEventoH(req,res){

    var eventoModel = new Evento()
   var params = req.body

    
    if (req.user.rol != 'ROL_ADMIN') {

        return res.status(500).send({ mensaje: 'No posee los permisos necesarios' })
    }

    Hotel.findOne().sort({ $natural: -1 }).limit(1).exec((err, HotelEncontrado) => {
        var idAdminH = HotelEncontrado._id

        if (params.nombre && params.tipoEvento && params.fecha) {


            eventoModel.nombre = params.nombre,
            eventoModel.tipoEvento = params.tipoEvento,
            eventoModel.fecha = params.fecha
            eventoModel.hotelevento = idAdminH,
             eventoModel.imagen = null
    
    
            Evento.find({ nombre: params.nombre, hotelevento: idAdminH }).exec((err, EventoEncontrado) => {
    
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (EventoEncontrado.length >= 1) {
    
                    return res.status(500).send({ mensaje: 'El nombre del evento ya existe' })
                } else {
    
                    eventoModel.save((err, EventoGuardado) => {
    
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion del evento' })
                        if (EventoGuardado) {
    
                            return res.status(200).send({ EventoGuardado })
                        } else {
    
                            return res.status(500).send({ mensaje: 'Error al guardar el evento' })
                        }
                    })
                }
            })
        } else {
    
            return res.status(500).send({ mensaje: 'Ingrese todos los parametros necesarios' })
        }
    })

  

}

function AgregarEvento(req, res) {

    var eventoModel = new Evento()
    var params = req.body;
    var idAdminH = req.params.id

    if (req.user.rol != 'ROL_ADMIN') {

        return res.status(500).send({ mensaje: 'No posee los permisos necesarios' })
    }

    if (params.nombre && params.tipoEvento && params.fecha) {


        eventoModel.nombre = params.nombre,
        eventoModel.tipoEvento = params.tipoEvento,
        eventoModel.fecha = params.fecha
        eventoModel.hotelevento = idAdminH,
         eventoModel.imagen = null


        Evento.find({ nombre: params.nombre, hotelevento: idAdminH }).exec((err, EventoEncontrado) => {

            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
            if (EventoEncontrado.length >= 1) {

                return res.status(500).send({ mensaje: 'El nombre del evento ya existe' })
            } else {

                eventoModel.save((err, EventoGuardado) => {

                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion del evento' })
                    if (EventoGuardado) {

                        return res.status(200).send({ EventoGuardado })
                    } else {

                        return res.status(500).send({ mensaje: 'Error al guardar el evento' })
                    }
                })
            }
        })
    } else {

        return res.status(500).send({ mensaje: 'Ingrese todos los parametros necesarios' })
    }
}

function EditarEvento(req, res) {

    var idEvento = req.params.id
    var params = req.body
    var idhotelEv


    if (req.user.rol != 'ROL_ADMIN') {
        if (req.user.rol != 'ROL_ADMIN_H') {
            return res.status(500).send({ mensaje: 'No posee los permisos para editar Eventos' })
        }
    }

    Evento.findById(idEvento).exec((err, EventoEncontrado) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (EventoEncontrado) {
            idhotelEv = EventoEncontrado.hotelevento
        }
        if (!EventoEncontrado) {
            return res.status(500).send({ mensaje: 'El evento no existe' })
        } else {

            Usuario.findOne({ adminH: idhotelEv }).exec((err, AdminEncontrado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (AdminEncontrado) {
                    var idadmin = AdminEncontrado._id
                }
                if (!AdminEncontrado) {
                    return res.status(500).send({ mensaje: 'El administrador no existe' })
                } else {

                    if (idadmin != req.user.sub) {
                        return res.status(500).send({ mensaje: 'No puede editar un evento de un Hotel ajeno' })
                    } else {
                        Evento.find({ nombre: params.nombre, hotelevento: idhotelEv }).exec((err, EventoEncontrado) => {
                            if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                            if (EventoEncontrado.length >= 1) {
                                return res.status(500).send({ mensaje: 'El Evento ya esta registrado' })
                            } else {

                                Evento.findByIdAndUpdate(idEvento, params, { new: true }, (err, EventoEncontrado) => {
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                                    if (!EventoEncontrado) return res.status(500).send({ mensaje: 'El evento no existe' })
                                    if (EventoEncontrado) return res.status(200).send({ EventoEncontrado })
                                })
                            }
                        })
                    }
                }
            })


        }

    })

}

function EliminarEvento(req, res) {

    var idEvento = req.params.id

    if (req.user.rol != 'ROL_ADMIN') {
        if (req.user.rol != 'ROL_ADMIN_H') {
            return res.status(500).send({ mensaje: 'No posee los permisos para editar Eventos' })
        }
    }

    Evento.findById(idEvento).exec((err, EventoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!EventoEncontrado) return res.status(500).send({ mensaje: 'El evento no existe' })
        var idEventoHotel = EventoEncontrado.hotelevento

        if (req.user.rol === 'ROL_ADMIN') {

            Evento.findByIdAndDelete(idEvento, (err, EventoEliminado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (!EventoEliminado) return res.status(500).send({ mensaje: 'El evento no existe' })
                return res.status(200).send(EventoEliminado)
            })
        } else {
            if (req.user.adminH != idEventoHotel) return res.status(500).send({ mensaje: 'No puede Eliminar un evento de un Hotel ajeno' })
            Evento.findByIdAndDelete(idEvento, (err, EventoEliminado) => {
                if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                if (!EventoEliminado) return res.status(500).send({ mensaje: 'El evento no existe' })
                return res.status(200).send(EventoEliminado)
            })
        }

    })
}

function VerEvento(req, res) {

    var eventoid = req.params.id

    Evento.find({ hotelevento: eventoid }).exec((err, EventoEncontrado) => {

        if (err) return res.status(500).send({ mensaje: 'Error en la peticion de obtener Eventos' })
        if (!EventoEncontrado) {
            return res.status(200).send({ mensaje: 'Aun no se han registrado eventos' })
        } else {

            return res.status(500).send({ EventoEncontrado })
        }
    })
}

function buscarEventos(req,res){
    
    var Eventoid = req.params.idEven

    Evento.find({hotelevento:Eventoid}).exec((err, EventoEncontrado)=>{
        console.log(EventoEncontrado)
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion'})
        if(!EventoEncontrado) return res.status(500).send({ mensaje: 'Aun no se han registrado eventos' })
        return res.status(200).send({ EventoEncontrado})
    })
}



module.exports = {
    buscarEventos,
    AgregarEvento,
    VerEvento,
    EditarEvento,
    EliminarEvento,
    agregarEventoH
}