
const joinForm = document.getElementById('join')
const homeUrl = document.location.origin


const joinUsernameInput = document.getElementById('join-username-input')
const joinPasscodeInput = document.getElementById('join-passcode-input')

function isEmpty(value)
{
   if(value.trim() == '')
   {
      return true
   }
   return false
}

joinForm.addEventListener('submit', async e =>{
   e.preventDefault()
   
   const username = joinUsernameInput.value
   const passcode = joinPasscodeInput.value

   /*room comes from html template*/
   const url = `${homeUrl}/join/${room}`
   
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
      body: JSON.stringify({join:{username,passcode}}) 
    });

    data = await response.json()
    console.log(data)
   //window.location.replace(url)
})