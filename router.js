const router = require('express').Router()
const Config = require('./Config')
const Room = require('./controllers/Room')

router.get('/',(req,res)=>{
   res.render('home',{home: Config.BASE_URL})
})

router.get('/join/:room', (req,res)=>{
   const room = req.params.room
   res.render('join',{room:room,home: Config.BASE_URL})
})

router.get('/room', (req,res)=>{
   if(!req.query.t){
      res.status(403).end('Token is required')
   }
   const token = req.query.t
   res.render('room',{home:Config.BASE_URL})
})


/*
   ---Post requests----
   ---create---
   create new room

   ---join---
   check username to ensure its not already in use
   validate passcode
   generate token

   ---room---
   *does not need username because it's inside the token

*/

router.post('/create', Room.create) 

router.post('/join/:room',Room.join) 




module.exports = router