const createForm = document.getElementById('create')

const homeUrl = document.location.origin

const createRoomInput= document.getElementById('create-room-input')
const createPasscodeInput = document.getElementById('create-passcode-input')
const joinDetails = document.getElementById('join-details')
const joinLink = document.getElementById('join-link')
const copyBtn = document.getElementById('copy-btn')
const joinBtn = document.getElementById('join-btn')
const tempLinkInput = document.getElementById('temp-link-input')

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
   if(response.status != 200){
      alert(data)
   }else{
      alert('Room created successfully')
      joinDetails.style.display = "block";
      const link = `${location.origin}/join/${room}`
      joinLink.innerHTML= link
      tempLinkInput.innerHTML= document.getElementById('join-link').innerText
   }
   
   
})

joinBtn.addEventListener('click',(e)=>{
   location.replace(`${location.origin}/join/${createRoomInput.value}`)
})

copyBtn.addEventListener('click',(e)=>{
   tempLinkInput.select()
   document.execCommand('copy')
}) 
