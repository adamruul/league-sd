import {joinRoom} from 'trystero'

/*
    const config = {appId: 'league-sd'}
    const room = joinRoom(config, "wef") // Create room based on URI
    room.onPeerJoin(peerId => console.log(`${peerId} joined`))
    room.onPeerLeave(peerId => console.log(`${peerId} left`))
    const [sendHello, getHello] = room.makeAction('hello')
    sendHello({"sender": "lol"})

    // listen for drinks sent to you
    //getHello((data, peerId) =>
    //    console.log(`${peerId} says Hello!`)
        
        console.log(
            `got a ${data.drink} with${data.withIce ? '' : 'out'} ice from ${peerId}`
        )
    //)
    */
   console.log("Hello Lib!")
    function sayHellox() {
        console.log("sayHello")
        sendHello({"sender": "lol"})
    }
    // room.leave()
    /*
    onMount(async () => {
      window.myGlobalFunc = function() { console.log("Hello Global! ") };
      document.getElementById("sayHello").addEventListener("click", sayHellox);
});

   } catch (error) {
    console.log("Could not run JavaScript")
  }
  */