


/*

For loop to go through top AITA 100 json 

for (int i = 0; i < 100; i++) {
    title = json.data.children[i].data.title
    body = json.data.children[i].data.selftext
    id = json.data.children[i].data.id // t3_{id}
    link = json.data.children[i].data.url
}

*/

const BASE = "https://fsa-puppy-bowl.herokuapp.com/api/";
const COHORT = "2605-ALEX";
const API = BASE + COHORT;

let players = [];
let selectedPlayer = null;

/**
 *
 * Fetches all players from the API.
 * This function should not be doing any rendering
 * Instead, this function should be keeping our state up to date
 */
async function getPlayers() {
  try {
    const response = await fetch(API + "/players");
    const result = await response.json();
    players = result.data.players;
    render();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Fetches a single player from the API.
 * This function should not be doing any rendering
 * Instead, this function should be keeping our state up to date
 * @param {number} playerId
 */
/**
 * Note: In order to call fetchSinglePlayer() a player's id is required.
 * Unless we know the id of the player we are trying to fetch, we cannot call fetchSinglePlayer()
 */
async function getPlayer(id) {
  try {
    const response = await fetch(API + "/players/" + id);
    const result = await response.json();
    selectedPlayer = result.data.player;
    render();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Adds a new player to the roster via the API.
 * Once a player is added to the database, the new player
 * should appear in the all players page without having to refresh
 * @param {Object} newPlayer the player to add
 */
/* Note: we need data from our user to be able to add a new player
 * What does that sound like we need?
 */
/**
 * Note#2: addNewPlayer() expects you to pass in a
 * new player object when you call it. How can we
 * create a new player object and then pass it to addNewPlayer()?
 */

async function createPlayer(player) {
  try {
    const response = await fetch(API + "/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(player),
    });
    console.log(response);
    console.log(player);
    const result = await response.json();
    players.push(result.data.newPlayer);
    render();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Removes a player from the roster via the API.
 * Once the player is removed from the database,
 * the player should also be removed from our view without refreshing
 * @param {number} playerId the ID of the player to remove
 */
/**
 * Note: In order to call removePlayer() a player's id is required.
 * Unless we know the id of the player we are trying to remove, we cannot call removePlayer()
 */

async function deletePlayer(player) {
  try {
    const response = await fetch(API + "/players/" + player.id, {
      method: "DELETE",
    });
    selectedPlayer = null;
    const newPlayerList = await fetch(API + "/players");
    const newPlayers = await newPlayerList.json();
    players = newPlayers.data.players;
    render();
  } catch (error) {
    console.error(error);
  }
}

function PlayerListItem(player) {
  const $li = document.createElement("li");
  $li.innerHTML = `
  <button>${player.name}</button>
  <img id="player"src=${player.imageUrl} alt=${player.name}/>
  `;
  $li.addEventListener("click", () => getPlayer(player.id));
  return $li;
}

function PlayerList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("players");
  const $players = players.map(PlayerListItem);
  $ul.replaceChildren(...$players);
  return $ul;
}

function SelectedPlayer() {
  if (!selectedPlayer) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a player to learn more.";
    return $p;
  }
  const $player = document.createElement("section");
  $player.innerHTML = `
  <h3>${selectedPlayer.name} #${selectedPlayer.id}</h3>
  <h3>Breed: ${selectedPlayer.breed}</h3>
  <h3>Status: ${selectedPlayer.status}</h3>
  <img id="selectedPlayer" src=${selectedPlayer.imageUrl} alt=${selectedPlayer.name} />
  <h3>Team name: ${selectedPlayer.teamId}</h3>
  <button>Delete Player</button>
  `;
  const deleteButton = $player.querySelector("button");
  deleteButton.addEventListener("click", () => deletePlayer(selectedPlayer));
  return $player;
}

function PlayerForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
  <label>
    Name
    <input name="name" required/>
  </label>
  <label>
    Breed
    <input name="breed" required/>
  </label>
  <label>
    Status
    <select name="status" required>
      <option value="bench">Bench</option>
      <option value="field">Field</option>
    </select>
  </label>
  <label>
    Team name
    <input type="number" name="team"/>
  </label>
  <button>Add new player</button>
  `;

  // <label>
  //   Status
  //   <input name="status" required/>
  // </label>

  $form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData($form);
    const player = {
      name: data.get("name"),
      breed: data.get("breed"),
      status: data.get("status"),
      teamId: data.get("team"),
    };
    createPlayer(player);
  });
  return $form;
}

/**
 * Updates html to display a list of all players or a single player page.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player in the all player list is displayed with the following information:
 * - name
 * - image (with alt text of the player's name)
 *
 * Additionally, for each player we should be able to:
 * - See details of a single player. The page should show
 *    specific details about the player clicked such as: name, id, breed, status, image, and team or unassigned if no team
 * - Remove from roster. When a button is clicked, should remove the player
 *    from the database and our current view without having to refresh
 *
 */
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
  <h1>Puppy Bowl Players</h1>
  <main>
    <section>
      <h2>Player List</h2>
      <PlayerList></PlayerList>
      <h2>Add Player</h2>
      <PlayerForm></PlayerForm>
    </section>
    <section id="selected">
      <h2>Player Details</h2>
      <SelectedPlayer></SelectedPlayer>
    </section>
  </main>
  `;

  $app.querySelector("PlayerList").replaceWith(PlayerList());
  $app.querySelector("SelectedPlayer").replaceWith(SelectedPlayer());
  $app.querySelector("PlayerForm").replaceWith(PlayerForm());
}

/**
 * Initializes the app by calling render
 * HOWEVER....
 */
async function init() {
  await getPlayers();
  render();
}

init();