const createForm = document.getElementById('create')
const joinForm = document.getElementById('join')
const homeUrl = document.location.origin

const createRoomInput= document.getElementById('create-room-input')
const createNameInput = document.getElementById('create-name-input')
const joinRoomInput = document.getElementById('join-room-input')
const joinNameInput = document.getElementById('join-name-input')
function isEmpty(value)
{
   if(value.trim() == '')
   {
      return true
   }
   return false
}
createForm.addEventListener('submit', e =>{
   e.preventDefault()
   const room = createRoomInput.value
   const name = createNameInput.value
   if(isEmpty(room) || isEmpty(name))
   {
      alert('room or name is empty')
      return
   }
   const url = `${homeUrl}/room/${room}?name=${name}`
   window.location.replace(url)
   
   
})
joinForm.addEventListener('submit', e =>{
   e.preventDefault()
   const room = joinRoomInput.value
   const name = joinNameInput.value
   if(isEmpty(room) || isEmpty(name))
   {
      alert('room or name is empty')
      return
   }
   const url = `${homeUrl}/room/${room}?name=${name}`
   window.location.replace(url)
})