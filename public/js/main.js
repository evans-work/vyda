const socket = io(window.location.origin,{query:{username:username,room:room}})
let peers = {};


socket.on('connect',() =>{
   console.log('connected to server')
  
})

socket.on('joining',({isJoining,isWaiting})=>{
   if(isJoining){
      console.log('joining')
   }
   if(isWaiting){
      console.log('Waiting for others')
   }
})

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

function start()
{
   if(!navigator.mediaDevices.getUserMedia)
   {
      navigator.mediaDevices.getUserMedia = function(constraints){
         var getUserMedia = navigator.webkitGetUserMedia | navigator.mozGetUserMedia|navigator.msGetUserMedia
         // console.log('getUserMedia',getUserMedia)
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

      

   })
   .catch(err => 
   {
      alert('error')
      console.error(err)
      
   })

}

//start the call

start()



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
         socket.emit('icecandidate',{candidate:e.candidate,to:username},({error}) =>{
            if(error)
            {
               alert(error)
            }
         })
      }       
   }) 
   const thisPeerStream = new MediaStream()

   thisPeerVideoContainer = document.createElement('div')
   thisPeerVideoContainer.classList = 'remoteVideo'
   thisPeerVideoMute = document.createElement('button')
   thisPeerVideoMute.setAttribute('video',username)
   thisPeerVideoMute.classList= "mute-btn fa fa-volume-mute"
   
   thisPeerVideoMute.addEventListener('click', e =>{
      muteUnmute(e)
   })
   thisPeerVideoContainer.appendChild(thisPeerVideoMute)
   const thisPeerVideo = document.createElement('video')
   thisPeerVideo.setAttribute('width',window.innerWidth/2)
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
   
   thisPeerVideo.addEventListener('canplay',e =>{
      e.target.play()
      e.target.style.opacity=1;
   })
   thisPeerVideoContainer.appendChild(thisPeerVideo)
   remoteVideosContainer.appendChild(thisPeerVideoContainer)
   peers[username] = {
      name:username,
      connection:newPeer,
      stream: thisPeerStream,
      video:thisPeerVideo
   }
   //console.log('peers',peers)
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
      socket.emit('offer',{offer:offer,to:username},({error}) =>{
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
      socket.emit('answer',{answer:answer,to:username},({error}) =>{
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

function onOffer({from,offer})
{
   console.log('received offer')
   peer = createPeer(from)
   console.log('setting remote description')
   peer.connection.setRemoteDescription(offer)
   sendAnswer(from)
   
}

function onAnswer({from,answer})
{
   console.log('received answer')
   console.log('setting remote descripiton')
   peer = findPeer(from)
   peer.connection.setRemoteDescription(answer)
}

function oniceCandidate({username,candidate})
{
   console.log('new ice candidate')
   peer = findPeer(username)
   peer.connection.addIceCandidate(candidate)
}


socket.on('join', ({username}) => {
   const peer = findPeer(username)
   if(peer)
   {
      if(peer.connection.connectionState == 'connected'){
         return console.log('You already have a viable connection to this user') 
      }

      peer.video.parentNode.remove()
      peer.connection.close()
      delete peers[username]   
   }
   sendOffer(username) 
})

socket.on('offer', (data) =>{
   onOffer(data)
})

socket.on('answer', (data) =>{
   onAnswer(data)
})

socket.on('icecandidate', (data) =>{
   oniceCandidate(data)
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
      return console.log('could not find disconnected user video ')
   }

   peer.video.parentNode.remove()
   peer.connection.close()
   delete peers[username]
   
})


socket.on('error',({message})=>{
   alert(message)
})
