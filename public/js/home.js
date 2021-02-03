const createForm = document.getElementById('create')

const homeUrl = document.location.origin

const createRoomInput= document.getElementById('create-room-input')
const createPasscodeInput = document.getElementById('create-passcode-input')

function isEmpty(value)
{
   if(value.trim() == '')
   {
      return true
   }
   return false
}
createForm.addEventListener('submit', async (e) =>{
   e.preventDefault()
   const room = createRoomInput.value
   const passcode = createPasscodeInput.value
   
   if(isEmpty(room) || isEmpty(passcode))
   {
      alert('room or passcode is empty')
      return
   }
   const url = `${homeUrl}/create`

   const response = await fetch(url, {
   method: 'POST', 
   mode: 'cors',
   cache: 'no-cache',
   credentials: 'same-origin',
   headers: {
      'Content-Type': 'application/json'
   },
   redirect: 'follow',
   referrerPolicy: 'no-referrer', 
   body: JSON.stringify({create:{room:room, passcode:passcode}}) 
   });

   data = await response.json()
   console.log(data)
   
})
