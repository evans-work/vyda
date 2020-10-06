const express = require('express')
const app = express()
const server = require('http').createServer(app)

const io = require('socket.io')(server)
const {addUser,findUser,removeUser,userCount} = require('./users.js')
const cors = require('cors')
const{v4:uuidv4} = require('uuid')

app.use(cors())

app.set('view engine','ejs')
app.use(express.static('public'))

app.get('/',(req,res) =>{
   
   res.render('home')
})
app.get('/create',(req,res) =>{
   res.redirect(`room/${uuidv4()}`)
})

app.get('/room/:room',(req,res) =>{
   res.render(`${__dirname}/views/room`,{id:req.params.room,name:req.query.name})
})

io.on('connection', socket =>{
   console.log('new connection')
   socket.on('join', (data,callback)=>{
      onJoin(socket,data,callback)
   })

   socket.on('offer',(offer,callback) =>{
      onOffer(offer,callback)
   })
   socket.on('answer',(answer,callback) =>{
      onAnswer(answer,callback)
   })
   socket.on('icecandidate',(candidate,callback) =>{
      onIcecandidate(candidate,callback)
   })
   socket.on('disconnect', e =>{
      console.log('user disconnected')
      thisUser = findUser(socket.username)
      console.log('disconnected user',socket.username)
      console.log('user count',userCount())
      
      if(thisUser)
      {
         console.log('before removal',userCount())
         username = thisUser.username
         thisRoom = thisUser.room
         socket.broadcast.to(thisRoom).emit('remove',{username:username})
         removeUser(username)
         console.log('after Removal',userCount())
         console.log(userCount())

      }
      
      
   })
   

})

function onJoin(socket,{name,room},callback)
{
   
   socket.join(room ,err =>{
      callback({error:err})
      return
   })
   const userObject = {
      username: name === "user"? uuidv4():name,
      room:room,
      socket:socket
   }
   socket.username = userObject.username
   const {error,success} = addUser(userObject)
   if (error)
   {
      callback({error:error})
      return
   }
   socket.emit('username',{username:userObject.username})
   socket.broadcast.to(room).emit('join',{username:userObject.username})
}

function onOffer({offer,to,from},callback)
{
   console.log('offer from',from)
   console.log('offer to',to)
   const user = findUser(to)
   if(!user)
   {
      callback({error:'offer:the user could not be found'})
      return
   }
   user.socket.emit('offer',{username:from,offer:offer})
   

}
function onAnswer({answer,from,to},callback)
{
   console.log('answer from ',from)
   console.log('answer to ',to)
   const user = findUser(to)
   if(!user)
   {
      callback({error:'answer:the user could not be found'})
      return
   }
   user.socket.emit('answer',{username:from,answer:answer})

}
function onIcecandidate({candidate,from,to},callback)
{
   const user = findUser(to)
   if(!user)
   {
      callback({error:'candidate:the user could not be found'})
      return
   }
   user.socket.emit('icecandidate',{username:from,candidate:candidate})

}
console.log(userCount())
server.listen(process.env.PORT,() => console.log(`server listening on port ${process.env.PORT}`))