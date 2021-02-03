const Config = require('../Config')
const RequestHandler = require('../RequestHandler')
const Rooms = require('../Rooms')
const jwt = require('jsonwebtoken')
const Joi = require('joi')

module.exports = class Room{
   static async create(req,res){
      try {
         
         if(!req.body || !req.body.create){
            RequestHandler.throwError(400,'Empty request')()
         }

         const room = req.body.create
         const roomName = room.room.toLowerCase()

         const schema = Joi.object({
            room:Joi.string().required(),
            passcode: Joi.string().required()
         })

         const {error} = await schema.validate(room)
         if(error){
            RequestHandler.throwError(400,error.details[0].message)()
         }

         const afterAdding = Rooms.addRoom(roomName,room)

         if(afterAdding.error){
            RequestHandler.throwError('',500,afterAdding.error)()
         }
         RequestHandler.sendSuccess(room,res)
         
      } catch (error) {
         
         RequestHandler.sendError(error,res)
      }
   }

   static async join(req,res){
      try {
         if(!req.body || !req.body.join){
            RequestHandler.throwError(400,'No data was submitted')()
         }
         const room = req.params.room
         console.log('room',room)
         const info = req.body.join
         if(!Rooms.roomExists(room)){
            RequestHandler.throwError(400,'Invalid room')()
         }

         if(!Rooms.checkPasscode(room,info.passcode)){
            RequestHandler.throwError(400,'Invalid passcode')()
         }

         const {error,success} = Rooms.addUser(room,info.username,info)

         if(error){
            RequestHandler.throwError('',500,error)()
         }

         const token = jwt.sign({
            room:room,
            username:info.username
         },Config.JWTSECRET)

         RequestHandler.sendSuccess({token:token},res)

      } catch (error) {
         console.log(error)
         RequestHandler.sendError(error,res)
      }
      
   }


}