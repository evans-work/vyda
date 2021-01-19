module.exports = class RequestHandler{

   static throwError(status,errorMessage,e){
      return () =>{
         if(e){
            if(status){
               e.status = status
            }
             throw e

         }else{
            if(!status || typeof status != 'number'){
               status = 500
            }
            e = new Error(errorMessage)
            e.status = status
            throw e
         }
         
      }
   }

   static sendError(error,res){

      return res.status(error.status || 500).json(error.message)
   }

   static sendSuccess(data,res){
      return res.status(200).json(data)
   }
   
   static renderError(error,res){
      return res.status(error.status).end(error.message)
   }

   static renderTemplate(name,res,data){
      res.render(`${appRoot}/views/${room}`,data)
   }
}