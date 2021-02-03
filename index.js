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
const jwt = require('jsonwebtoken')

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
   const token = socket.handshake.query.token
   const details = getConnectionDetails(token)
   console.log('details',details)
   if(details.error){
      return socket.emit('error',{message:details.error})
   }
   const username = details.details.username
   const room = details.details.room
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
   socket.on('join',() =>{
      console.log('joining')
      join(socket)
   })
    
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
      Rooms.removeUser(socket.room,socket.username)
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
   //socket.emit('joining',{isJoining:true,isWaiting:false})
}

function getConnectionDetails(token){
   console.log('token = ',token)
   if(token && token == ''){
      return {error:'No token provided'}
   }
   try { 
      const details = jwt.verify(token,Config.JWTSECRET)
      return {details:details}
   } catch (error) {
      return {error:error.message}
   }
}



server.listen(process.env.PORT,() => console.log(`server listening on port ${process.env.PORT}`))