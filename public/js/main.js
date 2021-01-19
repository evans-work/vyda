const socket = io(window.location.origin,{query:{username:username,room:room}})
let peers = {};


socket.on('connect',() =>{
   console.log('connected to server')
  
})

// socket.on('joining',({isJoining,isWaiting})=>{
//    if(isJoining){
//       console.log('joining')
//    }
//    if(isWaiting){
//       console.log('Waiting for others')
//    }
// })

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
         console.error('Source object(srcObject) is not supported',error)
         try {
            localVideo.src = window.URL.createObjectURL(window.localStream)
         } catch (error) {
            console.error('source(src) is also not supported',error)
         }
         
      }

      localVideo.addEventListener('loadedmetadata',() =>{
         localVideo.play()
      })

      socket.emit('join')

      // if(Object.keys(peers).length>0)
      // {
      //    console.log('Adding local stream to already inititated peers')
      //   for(key in peers){
      //       tracks.forEach(track =>{
      //          peers[key].stream.addTrack(track,stream)
      //       })
      //    }
      // }


   })
   .catch(err => 
   {
      
      console.error('making local stream',err)
      socket.close()
      
   })

}

//start the call

start()



function findPeer(username)
{
   return peers[username]
}

function createPeer(username,isLocal=false)
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
   }else{
      
      console.log(`no local stream when creating peer for ${username}`)
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
      console.error(' source object is not supported',error)
      try {
         thisPeerVideo.src = window.URL.createObjectURL(thisPeerStream)
      } catch (error) {

         console.error('Using source(src) also does not work',error)
         alert(`could not create video for ${username}`)
         
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
      console.log(`received tracks from ${username}`)
      thisPeer = findPeer(username)
      // thisPeer.stream.addTrack(e.track,thisPeer.stream)
      thisPeer.stream.addTrack(e.track)
   })

   return peers[username]
}


function sendOffer(username)
{
   console.log(`creating offer for ${username}...`)
   peer = createPeer(username)
   peer.connection.createOffer()
   .then(offer =>{
      console.log(`setting local description for ${username}...`)
      peer.connection.setLocalDescription(offer)
      console.log(`sending offer to ${username}...`)
      socket.emit('offer',{offer:offer,to:username},({error}) =>{
         if(error)
         {
            alert(error)
         }
      })
   })
   .catch( err => {
      alert(`could not connect with ${username} (offer)`)
      console.error(err)
   })
  
}

function sendAnswer(username)
{
   console.log('creating answer...')
   peer = findPeer(username)
   peer.connection.createAnswer()
   .then(answer =>{
      console.log(`Setting local description for ${username}... `)
      peer.connection.setLocalDescription(answer)
      console.log(`sending answer to ${username}..`)
      socket.emit('answer',{answer:answer,to:username},({error}) =>{
         if(error)
         {
            alert(error)
            
         }
      })
   }) 
   .catch( err => {
      alert(`could not connect with ${username} (answer)`)
      console.error(err)
   })

}

function onOffer({from,offer})
{
   console.log(`received offer from ${from}`)
   peer = createPeer(from)
   console.log(`setting remote description for ${from}...`)
   peer.connection.setRemoteDescription(offer)
   sendAnswer(from)
   
}

function onAnswer({from,answer})
{
   console.log(`received answer from ${from}...`)
   console.log(`setting remote descripiton for ${from}...`)
   peer = findPeer(from)
   peer.connection.setRemoteDescription(answer)
}

function oniceCandidate({username,candidate})
{
   console.log(`new ice candidate for ${username}`)
   peer = findPeer(username)
   peer.connection.addIceCandidate(candidate)
}


socket.on('join', ({username}) => {
   const peer = findPeer(username)
   if(peer)
   {
      const connectionState = peer.connection.connectionState
      console.log(`received an extra join request from ${username} at connection state`,connectionState)
      
      switch (connectionState) {
         case 'connected':
            console.log(`You already have a viable connection to ${username}`)
            break;
         
         case 'connecting':
            console.log(`Still connecting to ${username}`)
            break;
         default:
            peer.video.parentNode.remove()
            peer.connection.close()
            delete peers[username] 
            console.log(`Problem with connection to ${username}. retrying...`)
            sendOffer(username)
            break;
      }   
  
   }else{
      sendOffer(username) 
   }
   
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
   alert(`${username} disconnected`)
   console.log(`${username}  disconected`)
   peer = findPeer(username)
   if(peer)
   {
      peer.video.parentNode.remove()
      peer.connection.close()
      delete peers[username]
      console.log(` removed ${username} video`)
   }
   else
   {
      return console.log(`Could not find ${username} video `)
   }

   
   
})


socket.on('error',({message})=>{
   alert(message)
})
