'use strict'

var Servicio = require("../model/servicio.model")
var Hotel = require("../model/hotel.model")
var Reservacion = require("../model/reservacion.model")

function AgregarServicio(req, res) {

    var params = req.body
    var servicioModel = new Servicio();

    if(req.user.rol != 'ROL_ADMIN'){

        return res.status(500).send({mensaje:'No posee los permisos para agregar un servicio'})
    }

    Hotel.findOne().sort({ $natural: -1 }).limit(1).exec((err,HotelEncontrado)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
        if(!HotelEncontrado) return res.status(500).send({ mensaje:'El hotel no existe'})
        var idHotel = HotelEncontrado._id
        if(params.nombre && params.precio) {

            servicioModel.nombre = params.nombre,
            servicioModel.precio = params.precio,
            servicioModel.hotelServicio = idHotel
    
            Servicio.find({nombre: params.nombre, hotelServicio:idHotel }).exec((err,ServicioEncontrado)=>{
    
                if(err) return res.status(500).send({mensaje:'Error en la peticion'})
                if(ServicioEncontrado.length >= 1){
    
                    return res.status(500).send({mensaje:'El servicio ya existe'})
                }else{
    
                    servicioModel.save((err,ServicioGuardado)=>{
    
                        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
                        if(ServicioEncontrado){
    
                            return res.status(200).send({ServicioGuardado})
                        }else{
    
                            return res.status(500).send({mensaje:'No se pudo agregar un nuevo servicio'})
                        }
                    })
                }
            })
        }
    })

    
}

function addServicio(req,res){


    var idHotel = req.params.id
    var params = req.body
    var servicioModel = new Servicio();

    if(req.user.rol != 'ROL_ADMIN'){

        return res.status(500).send({mensaje:'No posee los permisos para agregar un servicio'})
    }

    if(params.nombre && params.precio) {

        servicioModel.nombre = params.nombre,
        servicioModel.precio = params.precio,
        servicioModel.hotelServicio = idHotel

        Servicio.find({nombre: params.nombre, hotelServicio:idHotel }).exec((err,ServicioEncontrado)=>{

            if(err) return res.status(500).send({mensaje:'Error en la peticion'})
            if(ServicioEncontrado.length >= 1){

                return res.status(500).send({mensaje:'El servicio ya existe'})
            }else{

                servicioModel.save((err,ServicioGuardado)=>{

                    if(err) return res.status(500).send({mensaje:'Error en la peticion'})
                    if(ServicioEncontrado){

                        return res.status(200).send({ServicioGuardado})
                    }else{

                        return res.status(500).send({mensaje:'No se pudo agregar un nuevo servicio'})
                    }
                })
            }
        })
    }
    
}

function actualizarServicio(req,res){

    var params = req.body
    var nombreSe


    Reservacion.findOne().sort({ $natural: -1 }).limit(1).exec((err,ReservacionEncontrada)=>{

        if(err) return res.status(500).send({mensaje:'error en la peticion'})
        if(!ReservacionEncontrada){

            return res.status(500).send({mensaje:'No existe la reservacion'})
        } else{

            var idReservacion = ReservacionEncontrada._id
            var idRes = ReservacionEncontrada.hotelH
            Servicio.findOne({nombre: params.nombre, hotelServicio: idRes}).exec((err, ServicioEncontrado)=>{
                if(err) return res.status(500).send({mensaje:'Error en la peticion '})
                if(!ServicioEncontrado){

                    return res.status(500).send({mensaje:'El servicio no existe'})
                } else{

                    var idServicio = ServicioEncontrado._id
                    var precioSer = ServicioEncontrado.precio
                    var serviciosE = ReservacionEncontrada.servicios

                    serviciosE.forEach(function(nombreS){

                         nombreSe = nombreS.nombre
                        console.log(nombreSe)

                    })
                    
                    //if(nombreSe.length >= 1 ) return res.status(500).send({mensaje:'No puede agregar dos veces un mismo servicio'})
                    
                    Reservacion.findByIdAndUpdate(idReservacion, {
                        $push:{

                            servicios:{
                                servicioId: idServicio,
                                nombre: params.nombre,
                                precio: precioSer
                            }
                        }
                    },{new:true}, (err,ServicioAgregado)=>{
                        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
                        if(ServicioAgregado){
                            return res.status(200).send({ServicioAgregado})
                        }else{

                            return res.status(500).send({mensaje:'No se agrego el servicio'})
                        }
                    })
                }
            })
        }



    })

}

function servicioID(req, res) {

    var idHotel = req.params.id

    Servicio.find({hotelServicio:idHotel}).exec((err,ServicioEncontrado)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
        if(!ServicioEncontrado) return res.status(500).send({mensaje:'no se han encontrado servicios'})
        return res.status(500).send({ServicioEncontrado})
    })
}

module.exports = {
    AgregarServicio,
    actualizarServicio,
    addServicio,
    servicioID
}