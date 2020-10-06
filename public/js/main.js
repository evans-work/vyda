const socket = io('/')
let peers = {};


const localVideo = document.querySelector('#local-video video')
const remoteVideosContainer = document.getElementById('remote-videos')
function muteUnmute(e)
{
   const videoID = e.target.getAttribute('video')
   const video = document.getElementById(videoID)
   if(!video.muted)
   {
     
      if(video)
      {
         console.log('muting video')
         video.muted = true
         e.target.classList = 'mute-btn fa fa-volume-up'
         return
      }
      console.log('could not locate video')   
      return
   }
   console.log('unmuting video')
   video.muted = false
   e.target.classList = 'mute-btn fa fa-volume-mute'
}


socket.on('connect',() =>{
   console.log('connected to server')
   
   start(startCall)
   
})

function startCall()
{
   let usernameToSend = name
   if(!usernameToSend)
   {
      if(window.username)
      {
         usernameToSend = window.username

      }
      else
      {
         usernameToSend = 'user'
      }
   }
   console.log('starting call')
   //roomId and name comes from the html page passed over by the server
   socket.emit('join', {name: usernameToSend,room:roomId},({error}) =>{
      if(error)
      {
         alert(error)
      }
   })
}
function start(callback)
{
   if(!navigator.mediaDevices.getUserMedia)
   {
      navigator.mediaDevices.getUserMedia = function(constraints){
         var getUserMedia = navigator.webkitGetUserMedia | navigator.mozGetUserMedia|navigator.msGetUserMedia
         console.log('getUserMedia',getUserMedia)
         if(!getUserMedia)
         {
            return  Promise.reject(new error('unable to access your media device in this browser, please try another'))
         
         }

         return new Promise(function(resolve,reject)
         {
            getUserMedia.call(navigator,constraints,resolve,reject)
         })
      }
   }
   //need the callback to start peer connections when we receive local stream
   navigator.mediaDevices.getUserMedia({video:true,audio:true})
   .then(stream =>{
      window.localStream = new MediaStream()
      console.log('received local stream')
      tracks = stream.getTracks()
      tracks.forEach(track =>{
         window.localStream.addTrack(track,stream)
      })

      try {
         localVideo.srcObject = window.localStream
      } catch (error) {
         console.error('no source object',error)
         try {
            localVideo.src = window.URL.createObjectURL(window.localStream)
         } catch (error) {
            console.error('error using source',error)
         }
         
      }

      localVideo.addEventListener('loadedmetadata',() =>{
         localVideo.play()
      })

      if(peers && peers.length>0)
      {
         peers.forEach(peer =>{
            tracks.forEach(track =>{
               peer.addTrack(track,stream)
            })
         })
      }

      callback()

   })
   .catch(err => 
   {
      alert('error')
      console.error(err)
      
   })

}



function findPeer(username)
{
   return peers[username]
}

function createPeer(username)
{
   const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
   const newPeer =  new RTCPeerConnection(configuration)
   if (window.localStream)
   {
      typeof(window.localStream)
      tracks = window.localStream.getTracks()
      tracks.forEach(track => {
         newPeer.addTrack(track,window.localStream)
      });
   }
   newPeer.addEventListener('icecandidate', e =>{  
      if(e.candidate != null)  
      {
         socket.emit('icecandidate',{candidate:e.candidate,to:username,from:window.username},({error}) =>{
            if(error)
            {
               alert(error)
            }
         })
      }       
   }) 
   thisPeerStream = new MediaStream()

   thisPeerVideoContainer = document.createElement('div')
   thisPeerVideoContainer.classList = 'remoteVideo'
   thisPeerVideoMute = document.createElement('button')
   thisPeerVideoMute.setAttribute('video',username)
   thisPeerVideoMute.classList= "mute-btn fa fa-volume-mute"
   thisPeerVideoMute.addEventListener('click', e =>{
      muteUnmute(e)
   })
   thisPeerVideoContainer.appendChild(thisPeerVideoMute)
   thisPeerVideo = document.createElement('video')
   thisPeerVideo.setAttribute('id',username)
   thisPeerVideo.srcObject = thisPeerStream
   try {
      thisPeerVideo.srcObject = thisPeerStream
   } catch (error) {
      console.error('no source object',error)
      try {
         thisPeerVideo.src = window.URL.createObjectURL(thisPeerStream)
      } catch (error) {
         console.error('error using src to assign video',error)
      }
      
   }
   
   thisPeerVideo.addEventListener('loadedmetadata',e =>{
      e.target.play()
      e.target.style.opacity=1;
   })
   thisPeerVideoContainer.appendChild(thisPeerVideo)
   remoteVideosContainer.appendChild(thisPeerVideoContainer)
   peers[username] = {
      name:name,
      connection:newPeer,
      stream: thisPeerStream,
      video:thisPeerVideo
   }
   newPeer.addEventListener('track', e =>{
      console.log('received tracks')
      thisPeer = findPeer(username)
      thisPeer.stream.addTrack(e.track,thisPeer.stream)
   })

   return peers[username]
}


function sendOffer(username)
{
   console.log('creating offer...')
   peer = createPeer(username)
   peer.connection.createOffer()
   .then(offer =>{
      console.log('setting local description...')
      peer.connection.setLocalDescription(offer)
      console.log('sending offer...')
      socket.emit('offer',{offer:offer,to:username,from:window.username},({error}) =>{
         if(error)
         {
            alert(error)
         }
      })
   })
   .catch( err => {
      alert('error')
      console.error(err)
   })
  
}

function sendAnswer(username)
{
   console.log('creating answer...')
   peer = findPeer(username)
   peer.connection.createAnswer()
   .then(answer =>{
      console.log('setting local description...')
      peer.connection.setLocalDescription(answer)
      console.log('sending answer..')
      socket.emit('answer',{answer:answer,from:window.username,to:username},({error}) =>{
         if(error)
         {
            alert(error)
         }
      })
   }) 
   .catch( err => {
      alert('error')
      console.error(err)
   })

}

function onOffer(offer)
{
   console.log('received offer')
   peer = createPeer(offer.username)
   console.log('setting remote description')
   peer.connection.setRemoteDescription(offer.offer)
   sendAnswer(offer.username)
   
}

function onAnswer(answer)
{
   console.log('received answer')
   console.log('setting remote descripiton')
   peer = findPeer(answer.username)
   peer.connection.setRemoteDescription(answer.answer)
}

function oniceCandidate({username,candidate})
{
   console.log('new ice candidate')
   peer = findPeer(username)
   peer.connection.addIceCandidate(candidate)
}

socket.on('username', ({username}) =>{
   console.log(`receive my username as ${username}`)
   window.username = username
   
})
socket.on('join', ({username}) => {
   const peerExists = findPeer(username)
   if(peerExists)
   {
      console.log('we already have a viable connection to this user. there is no reason to reconnect')
      return
   }
   sendOffer(username) 
})

socket.on('offer', (offer) =>{
   onOffer(offer)
})

socket.on('answer', (answer) =>{
   onAnswer(answer)
})

socket.on('icecandidate', (icecandidate) =>{
   oniceCandidate(icecandidate)
})

socket.on('remove', ({username}) =>{
   console.log(` user ${username}  disconected`)
   peer = findPeer(username)
   if(peer)
   {
      console.log('found user video ')
      console.log('removing it ')
   }
   else
   {
      console.log('could not find disconnected user video ')
   }

   peer.video.parentNode.remove()
   peer.connection.close()
   delete peers[username]
   
})
