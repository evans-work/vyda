const RequestHandler = require('../RequestHandler')
module.exports = class Room{
   static async create(req,res){
      try {
         if(!req.body || !req.body.create){
            RequestHandler.throwError(400,'Empty request')()
         }
         const schema = Joi.object({
            room:Joi.string(),
            username:Joi.string()
         })
         const {error} = await schema.validate(req.body.create)
         if(error){
            RequestHandler.throwError(400,error.details[0].message)()
         }
   
         if(Rooms.exists(room)){
            RequestHandler.throwError(400,'The room already exists')()
         }
         const room = req.body.room
         const username = req.body.username
         //Todo add room to Rooms object.
      } catch (error) {
         RequestHandler.sendError(error,res)
      }
   }

   static async join(req,res){
      try {
         if(!req.body || !req.body.join){
            RequestHandler.throwError(400,'No data was submitted')()
         }
         
         console.log(req.body.join)
         RequestHandler.sendSuccess({success:true},res)
      } catch (error) {
         console.log(error)
         RequestHandler.sendError(error,res)
      }
      
   }

   static async room(req,res){
      try {    
         const room = req.params.room
         // if(!Rooms.exists(room)){
         //    RequestHandler.throwError(400,'Room does not exist')()
         // }
   
         let username = req.query.username
         if(!username){
            RequestHandler.throwError(400,'No username provided')()
         }
         res.render(`${appRoot}/views/room`,{room:req.params.room,username:username})
      } catch (error) {
         
         RequestHandler.renderError(error,res)
      }
    
   }

}