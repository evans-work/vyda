const router = require('express').Router()
const Room = require('./controllers/Room')

router.get('/',(req,res)=>{
   res.render('home')
})

router.get('/join/:room', (req,res)=>{
   const room = req.params.room
   res.render('join',{room:room})
})

router.post('/join/:room',Room.join)

router.post('/create', Room.create)

router.get('/room/:room', Room.room )


module.exports = router