
  <script>
    
    import {joinRoom, selfId} from 'trystero'
    import { onMount } from 'svelte';
    
    /*
    
    npm run build
    npm run preview
    
    */


let config = {appId: 'league-sd'}
let room = null
let sendHellox = null
let getHellox = null
let name = "Adam"
let msg = ""
let roomName = ""
let isConnected = false
let thisUser = ""
let connectedUsers = []

onMount(() => {
	roomName = location.hash == "" ? "some-room" : location.hash.replace("#", "")
});

  function connect() {
    thisUser = selfId
    console.log("Joining Room: " + roomName);
    room = joinRoom(config, roomName)
    console.log("Joined Room: " + roomName);
    console.log("Currently connected: " + room.getPeers())
    connectedUsers = room.getPeers()
    connectedUsers.push(thisUser)
    console.log("Hash: " + location.hash)
    room.onPeerJoin(peerId => {
      console.log(`${peerId} joined`)
      console.log("Currently connected: " + room.getPeers())
    })
    room.onPeerLeave(peerId => console.log(`${peerId} left`))
    isConnected = true;
    setInterval(function() {
      connectedUsers = room.getPeers()
      connectedUsers.push(thisUser)
    }, 5000);
    //console.log("selfId: " + selfId)
    const [sendHello, getHello] = room.makeAction('hello')
    sendHellox = sendHello
    getHellox = getHello
    getHellox((data, peerId) => {
        console.log(`Received ${JSON.stringify(data)} from ${peerId}`)
        // update config
        // draft with seed... and lock seed
        // reroll
        if (data["action"]== "roll") {
          msg = "Updated your message!"
        }
      }
    )
  }
    function broadcastHello() {
      console.log("Broadcasting hello")
      sendHellox({"action": "roll"})
      console.log("Hash: " + location.hash)
    }


  </script>


<body class="bg-base-200">
  <main class="py-10">

    <button id="sayHello3" on:click="{connect}" class="btn btn-primary" type="submit">connect</button>
    <button id="sayHello3" on:click="{broadcastHello}" class="btn btn-primary" type="submit">Broadcast Hello</button>
    <input type="text" bind:value={roomName} name="query" class="input input-bordered input-base input-info font-mono" placeholder="Room..." />
    <p class="text-lg pt-8">You: {thisUser}</p>
    <p class="text-lg">Connected: {isConnected}</p>
    <p>Connected users: {connectedUsers.length}</p>
</main>
</body>
