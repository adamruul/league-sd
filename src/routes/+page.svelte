<script>
    //import Form from "./Form.svelte"
    import seedrandom from "seedrandom"
    export let data
    import {page} from "$app/stores"
    import { fade, scale } from "svelte/transition";
    import {joinRoom, selfId} from 'trystero'
    //import * as Trystero from 'trystero';
    //const Trystero = require('trystero')
    import { onMount } from 'svelte';
    import Prando from 'prando';
    
    

    

// ---------------------------------------------------------------------------------------


    /*
    
    npm run build
    npm run preview
    
    TODO:
    - Pass players list
    - When you've rolled once, and roll again.... you need to update the rng_seed.
    - 
    
    */

    

let config = {appId: 'league-sd'}
let room = null
let sendHellox = null
let getHellox = null
let isConnected = false
let thisUser = ""
let roomName = ""
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
        if (data["action"]== "draft") {          
          rng_seed = data["rng_seed"]
          enable_wildcards = data["enable_wildcards"]
          captain_delegation = data["captain_delegation"]
          players = data["players"]
          draft(rng_seed, enable_wildcards, captain_delegation, players)
          has_drafted = true
        }
        if (data["action"]== "reroll") {          
          updateRerolledChampions(data["player_name"], data["new_champions"])
          has_rerolled = true
          console.log("Got Reroll for: " + data["player_name"])
        }
      }
    )
  }
    function broadcastDraft() {
      console.log("Broadcasting hello")
      if (has_drafted) {
        rng_seed = getNewSeed()
      }
      
      if (room != null){
        sendHellox({"action": "draft", "rng_seed": rng_seed, "enable_wildcards": enable_wildcards, "captain_delegation": captain_delegation, "players": players})
      }      
      draft(rng_seed, enable_wildcards, captain_delegation, players)
      console.log("Hash: " + location.hash)
      has_drafted = true
    }

  // p: players
  // p: player_name
  // p: rng_seed

  function updateRerolledChampions(player_name, new_selection){
    for (let i = players_draft.length - 1; i >= 0; i--) {
      if (players_draft[i].name == player_name){
      players_draft[i].champions = new_selection
      }
    }
  }

function reroll(player_name) {
  for (let i = players_draft.length - 1; i >= 0; i--) {
    if (players_draft[i].name == player_name){
      let new_champions = shuffle_simple(champion_pool[players_draft[i].role]).slice(0, 3)
      players_draft[i].champions = new_champions
      if (room != null){
        sendHellox({"action": "reroll", "player_name": player_name, "new_champions": new_champions})
      }
        has_rerolled = true
      console.log("Sent Reroll for: " + player_name)
    }
  }
}

// ---------------------------------------------------------------------------------------



    let champion_pool = data.champion_pool

/*
ROADMAP

- Preferred roles per player.
- Team composition evaluator

- Smidigare input för att lägga till Players. (Write first -> Add when pressing Enter).
- HubbaBubba index

*/

    /*
  Hard CC: 3
  Hard Engage: 2
  Poke: 1
  Waveclear: 1
  Tank: 2

  early game: 1
  mid game: 1
  late game: 2

  magical: 1
  physical: 1
  utility: 1
  tank: 2
  */

  let rng_seed = (Math.random() + 1).toString(36).substring(7);
  let enable_wildcards = false
  let wildcard_chance = 0.15
  let has_drafted = false
  let has_rerolled = false

  let captain_delegation = "Random"

  let wildcard_champ = {"name": "Wildcard", "img": "/star.png", "tags": []}
  

function getNewSeed() {
  return (Math.random() + 1).toString(36).substring(7);
}

  let role_icons = {
    "Top": "https://cdn3.emoji.gg/emojis/7990-lol-role-top.png",
    "Mid": "https://cdn3.emoji.gg/emojis/6934-lol-role-mid.png",
    "Jungle": "https://cdn3.emoji.gg/emojis/1152-lol-role-jungle.png",
    "Support": "https://cdn3.emoji.gg/emojis/7990-lol-role-support.png",
    "Bot": "https://cdn3.emoji.gg/emojis/9366-lol-role-bot.png",
  }

  let tag_to_bg_color = {
    "Hard CC": "bg-yellow-300",
    "Hard Engage": "bg-yellow-400",
    "Poke": "bg-amber-200",
    "Tank": "bg-lime-500",

    "Physical": "bg-orange-300",
    "Magical": "bg-violet-500",
    "Utility": "bg-stone-300",

    "Early Game": "bg-rose-200",
    "Mid Game": "bg-rose-300",
    "Late Game": "bg-rose-400"
  }

  function tag_color(tag) {
    if (tag in tag_to_bg_color) {
      return tag_to_bg_color[tag]
      //return tag_to_bg_color[tag]
    } else {
      console.log("Could not find tag color for: " + tag)
      return "bg-info"
      //return "#ffffff"
    }
  }


  function shuffle_array(array, rng_seed) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(seedrandom(rng_seed) * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array
}


function shuffle_simple(array) {
  let shuffledArray = array.sort((a, b) => 0.5 - Math.random());
  return shuffledArray;
}

function shuffle_adv(array, rng) {
  let shuffledArray = array.sort((a, b) => 0.5 - rng.next());
  return shuffledArray;
}


function compareRoles( a, b ) {
  if ( a.role < b.role ){
    return -1;
  }
  if ( a.role > b.role ){
    return 1;
  }
  return 0;
}

  let players = [
		{ name: 'Adam', most_fav_role: "None", least_fav_role: "None", easy_champions: false },
		{ name: 'Håkan', most_fav_role: "None", least_fav_role: "None", easy_champions: false },
		{ name: 'Chrille', most_fav_role: "None", least_fav_role: "None", easy_champions: false },
    { name: 'Valle', most_fav_role: "None", least_fav_role: "None", easy_champions: false },
    { name: 'Anton', most_fav_role: "None", least_fav_role: "None", easy_champions: false }
	];

  let player_name_input = ""

    let players_draft = []
    //draft("lol");

  const onKeyPress = e => {
    if (e.charCode === 13) {
      console.log(player_name_input)
      add_player()
      console.log(JSON.stringify(players))
    }
  };

    function add_player() {
      if (player_name_input.replaceAll(" ", "") != "") {
        let pname = player_name_input
        let pfav = "None"
        let pleast = "None"
        let pez = false

        if (players.length >= 5) {
          console.log("Too many players!")
          //var originalColor = document.getElementById("numPlayers").style.color;
          document.getElementById("numPlayers").style.color = 'red';
        } else {
        document.getElementById("numPlayers").style.color = 'white';
        players = players.concat({ name: pname , most_fav_role: pfav, least_fav_role: pleast, easy_champions: pez})
        player_name_input = "";
        }  
      }
    }

    function roll(chance_of_success) {
      return Math.random() < chance_of_success;
    }

    function roll_adv(chance_of_success, rng) {
      return rng.next() < chance_of_success;
    }

  const remove = (name) => {
    players = players.filter(t => t.name !== name);
}

	$: num_players = players.length;
  
  // p: wildcards?
  // p: players
  // p: rng_seed
  // p: captain

  function draft(rng_seed, use_wildcards, captain_dlg, player_list)  {
    let rng = new Prando(rng_seed);
    let roles = shuffle_adv(Object.keys(champion_pool), rng)
    let shuffled_players = shuffle_adv(player_list, rng)
    let d = []
    console.log("Seed: " + rng_seed)
    console.log("Players: " + JSON.stringify(players))
    console.log("Roles: " + roles)
    console.log("Wildcards: " + enable_wildcards)
    console.log("Captain Delegation: " + captain_delegation)
    // rng the captain
    for (let i = shuffled_players.length - 1; i >= 0; i--) {
      let draft_player_name = shuffled_players[i].name
      let draft_position = roles[i]
      let champions = shuffle_adv(champion_pool[draft_position],rng).slice(0, 3)
      
      if (use_wildcards && roll_adv(wildcard_chance, rng)) {
        champions = champions.slice(0, 2)
        champions.push(wildcard_champ)
      }
      console.log(JSON.stringify(champions))
      let is_captain = false
      
      if (i==0 && captain_dlg=="Random"){
        is_captain = true
      }
      
      if (draft_position == captain_dlg){
        is_captain = true
      }
      
      
      d.push({name: draft_player_name, role: draft_position, champions: champions, captain: is_captain})
    }

    players_draft = d.sort(compareRoles)
    console.log(JSON.stringify(players_draft))
    has_rerolled = false
  }
function capitalize(string) {
  return string[0]+string.slice(1).toLowerCase()
}




</script>

<body class="bg-base-200">
  <main class="py-10">
    
    <div class="container mx-auto mb-8">
  <div class="flex">
    <div class="flex w-1/2">
  <h1 class="text-3xl font-bold text-info">LoL SD</h1>
</div>
<div class="flex justify-end w-1/2 content-center">
{#if connectedUsers.length > 0}
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#23b81c" class="w-5 h-5 mt-1">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
</svg>
{:else}
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ff0000" class="w-5 h-5 mt-1">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
</svg>
{/if}
  <p class="text-sm ml-1 mt-1">{connectedUsers.length}</p>

  <input disabled={isConnected} type="text" bind:value={roomName} name="query" class="input input-sm input-bordered input-base input-info font-mono ml-8" placeholder="Room..." />
  <button disabled={isConnected} on:click={() => connect()} class="btn btn-sm ml-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-1">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>    
    Connect
  </button>
</div>
  </div>
  <div class="flex mt-8 ml-0">  
  <div class="flex items-start items-center mb-4 ml-4">
    <input type="checkbox" bind:checked={enable_wildcards} id="cb1" name="cb1" class="checkbox checkbox-info" />
    <label for="cb1" class="text-sm ml-1 font-medium">Wildcards?</label>
  </div>
  
  <div class="flex items-start items-center mb-4 ml-4">
    <input type="checkbox" id="cb2" name="cb2" class="checkbox checkbox-info" />
    <label for="cb2" class="text-sm ml-1 font-medium">Hubba?</label>
  </div>

  <div class="flex items-start items-center mb-4 ml-4">
    <input type="checkbox" id="cb3" name="cb3" class="checkbox checkbox-info" />
    <label for="cb3" class="text-sm ml-1 font-medium">Bubba?</label>
  </div>
  
  <div class="flex items-start items-center w-1/5 mb-4 ml-12">
    <p class="text-sm font-medium mr-2">Captain:</p>
    <select bind:value={captain_delegation} class="select select-info w-full min-w-full">
    <option>Random</option>
    <option>Top</option>
    <option>Mid</option>
    <option>Jungle</option>
    <option>Support</option>
    <option>Bot</option>
    <option>No Captain</option>
  </select>
  </div>

  <div class="flex items-start items-center justify-end mb-4 ml-4 w-full">
    <p class="text-sm font-medium mr-2">Seed:</p>
    <input type="text" bind:value={rng_seed} name="query" class="input input-bordered input-base input-info font-mono" placeholder="Seed..." />
    <button on:click={() => broadcastDraft()} class="btn w-3/5 btn-info ml-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>      
      Draft!
    </button>
  </div>

</div>



<div class="overflow-x-auto mt-10">
  <table class="table table-compact w-full">
    <thead class="text-gray-500">
      <tr>
        <th></th>
        <th id="numPlayers">{num_players}/5 players</th> 
        <th>Least Fav Role</th> 
        <th>Most Fav Role</th> 
        <th class="text-right pr-8">Easy Champions?</th> 
      </tr>
    </thead> 
    <tbody>
      {#each players as player}
      <tr>
        <th>
          <button type="button" on:click={() => remove(player.name)} class="mb-4 rounded-md p-1 inline-flex items-center text-gray-400 hover:text-red-400 hover:bg-neutral-focus focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
            <span class="sr-only">Close menu</span>
            <!-- Heroicon name: outline/x -->
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </th>
        <td class="text-lg font-semibold">{player.name}</td> 
        <td> 
          <select bind:value={player.most_fav_role} class="select select-sm select-bordered w-3/5 max-w-xs" disabled>
          <option selected>None</option>
          <option>Top</option>
          <option>Mid</option>
          <option>Jungle</option>
          <option>Bot</option>
          <option>Support</option>
        </select>
      </td> 
        <td>
          <select bind:value={player.least_fav_role} class="select select-sm select-bordered w-3/5 max-w-xs" disabled>
            <option selected>None</option>
            <option>Top</option>
            <option>Mid</option>
            <option>Jungle</option>
            <option>Bot</option>
            <option>Support</option>
          </select>
        </td> 
        <td class="text-right pr-8">
          <input bind:value={player.easy_champions} type="checkbox" id="cb1" name="cb1" class="checkbox border-2 checkbox-base-content" disabled/>
        </td>
      </tr>
      {/each}
      </tbody>
      </table>
      </div>
      <!-- https://svelte.dev/repl/d99826cdac4f4fdf8064f5b6a31676ff?version=3.18.2 -->
   
      
      <div class="flex items-center w-full mb-4 mt-4">
        <input type="text" bind:value={player_name_input} on:keypress={onKeyPress} name="query" class="input bg-neutral-focus w-full input-bordered" placeholder="Player Name..." />
        <button on:click={() => add_player()} class="btn bg-neutral-focus ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
          </svg>          
          Add Player
        </button>
      </div>
      

</div>

  <div class="flex flex-wrap gap-x-16 gap-y-24 px-8 py-12 justify-center">

  {#each players_draft as p (p.name + p.champions.map(x => x.name).join(",") )}
  <!-- table -->
  <div in:scale class="basis-1/4 text-sm">
    <!-- <div in:fade class="basis-1/4 text-sm animate-fade">-->
    <div class="flex items-start items-center w-full mb-4">
      <div class="avatar">
        <div class="w-16 rounded">
          <img src="{role_icons[p.role]}" />
        </div>
      </div>
      <p class="text-xl text-center font-bold tracking-tight">{p.role}:</p>
      {#if p.captain}
    <p class="text-xl text-center font-bold tracking-tight pl-4">{p.name}</p><p class="text-xl text-center content-center ml-4 -mt-1">👑</p>
    {:else}
    <p class="text-xl text-center font-bold tracking-tight pl-4">{p.name}</p>
    {/if}
    
    <button disabled={has_rerolled} on:click={() => reroll(p.name)} class="btn btn-sm btn-square btn-outline ml-4 hover:bg-info">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>      
    </button>
  </div>
    <table class="table table-compact w-full shadow-lg bg-base-100">
    <!-- head -->
    <thead>
      <tr>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody class="w-full bg-base-100">
      {#each p.champions as c} 
      <!-- rows -->
      <tr class="border-b-2 border-neutral">
        {#if !c.img}
        <td class="w-[6rem]"><img src="http://ddragon.leagueoflegends.com/cdn/13.1.1/img/champion/{c.name.split(" ").map(part => capitalize(part.replace("'",""))).join("")}.png" class="w-16 h-16" alt="Champion Portrait"/></td>
        {:else}
        <td class="w-[6rem]"><img src={c.img} class="w-16 h-16" alt="Champion Portrait"/></td>
        {/if}
        <td class="text-lg font-bold">{c.name}</td>
       
        <td class="flex gap-1 flex-wrap min-w-[12rem] max-w-[12rem] content-center">
          {#each c.tags as tag}
          <span class="whitespace-pre rounded-full {tag_color(tag)} px-[0.65em] pt-[0.35em] pb-[0.25em] text-center align-baseline text-[0.75em] font-bold leading-none text-base-300">
            {tag}
          </span>
          {/each}       
        </td>
      </tr>
      {/each}
    </tbody>
  </table>
</div>
{/each}
</div>
</main>
</body>