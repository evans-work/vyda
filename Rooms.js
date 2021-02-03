module.exports = class Rooms{
   static rooms = {}
   /*
   room = {
      name:String,
      users:{username:{priority:''}},
      passcode:String
   }
    */

   static addRoom(roomName,details){
      if(this.rooms[roomName]){
         const e = new Error('Room name is already taken')
         e.status = 400
         return {error: e}
      }
      this.rooms[roomName] = details
      this.rooms[roomName].users = {}
      console.log(this.rooms)
      return {success:'Room created successfully'}
   }

   static checkPasscode(roomName,passcode){
      if(this.rooms[roomName] && this.rooms[roomName].passcode == passcode){
         return true
      }
      return false
   }

   static addUser(roomName,username,details){
      if(!this.rooms[roomName]){
         const e = new Error('Room has not been created')
         e.status = 400
         return {error: e}

      }else if(this.rooms[roomName].users[username]){
         const e = new Error('Sorry the username is already taken')
         e.status = 400
         return {error: e}
      }
      
      this.rooms[roomName].users[username] = details
      return {success:'user add successfully'}
   }



   static removeRoom(name){
      delete this.rooms[name]

   }

   static removeUser(room,user){
      delete this.rooms[room]['users'][user]
   }

   static roomExists(roomName){
      console.log(this.rooms)
      if(this.rooms[roomName]){
         return true
      }
      return false
   }

   static userExists(roomName,userName){
      if(this.rooms[roomName] && this.rooms[roomName][userName]){
         return true
      }
      return false
   }
}