module.exports = class Rooms{
   static rooms = {}

   static add(name,room){
      this.rooms[name] = room
   }
   static remove(name){
      delete this.rooms[name]

   }
   static exists(name){
      if(this.rooms[name]){
         return true
      }
      return false
   }
}