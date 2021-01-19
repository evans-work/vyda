//node
const path = require('path')

//Third party
const express = require('express')
const app = express()

const{v4:uuidv4} = require('uuid')
const Joi = require('joi')
const cors = require('cors')
const server = require('http').createServer(app)
const io = require('socket.io')(server)

require('dotenv').config()

//local
const RequestHandler = require('./RequestHandler')
const Config = require('./Config')
const Rooms = require('./Rooms')


//global variables
global.appRoot = path.resolve(__dirname);

//middlewares
app.use(express.json())
app.use(cors())
app.use(express.static('public'))

app.set('view engine','ejs')

app.use(require('./router'))

//socket.io

io.on('connection', async (socket )=>{
   const username = socket.handshake.query.username
   const room = socket.handshake.query.room
   console.log('username',username)
   console.log('room',room)
   console.log('new connection')
   socket.room = room
   socket.username = username

   try {
      socket.join(username)
   } catch (error) {
      socket.emit('error',{message:'Error initializing a personal room'})
   }

   try {
      socket.join(room)
   } catch (error) {
      socket.emit('error',{message:'Error joining room'})
   }
   
   //send join requests to other users
   join(socket)
    
   socket.on('offer',({offer,to},callback) =>{
      socket.to(to).emit('offer',{from:socket.username,offer})
   })

   socket.on('answer',({answer,to},callback) =>{
      socket.to(to).emit('answer',{from:socket.username,answer:answer})
   })

   socket.on('icecandidate',({candidate,to},callback) =>{

      socket.to(to).emit('icecandidate',{username:socket.username,candidate:candidate})
   })

   socket.on('disconnect', e =>{
      socket.to(socket.room).emit('remove',{username:socket.username})
      console.log('disconnected ',socket.username)
   })
   
})



function join(socket){
   // if(!Rooms.exists){
   //    return socket.emit('error','The room you are trying to join does not exist')   
   // }

   // const clients = await io
   // console.log('clients',clients.length)
   
   socket.to(socket.room).emit('join',{username:socket.username})
   socket.emit('joining',{isJoining:true,isWaiting:false})
}



server.listen(process.env.PORT,() => console.log(`server listening on port ${process.env.PORT}`))