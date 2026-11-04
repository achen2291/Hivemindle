/* 
global variables
*/

let gameTitle;
let gameBody;
let gameNTA;
let gameYTA;
let gameESH;
let gameNAH;
let gameNTACount;
let gameYTACount;
let gameESHCount;
let gameNAHCount;
let gameVerdictSum;
let gameMarginOfError;
const maxGameLength = 6;

// Timeout IDs
let shakeTimeout;
let toastTimeout;
let warningTimeout;

// First day of games
const startDate = new Date("11/2/2026");
const gameNumber = getGameNumber();

// Elements with event listeners to play the game
const inputNTA = document.getElementById("NTA-guess-input");
const inputYTA = document.getElementById("YTA-guess-input");
const inputESH = document.getElementById("ESH-guess-input");
const inputNAH = document.getElementById("NAH-guess-input");
const buttonInput = document.getElementById("guess-button");

const infoButton = document.getElementById("info-button");
infoButton.addEventListener("click", switchState);

const statsButton = document.getElementById("stats-button");
statsButton.addEventListener("click", switchState);

// User stats saved locally
const userStats = JSON.parse(localStorage.getItem("stats")) || {
  numGames: 0,
  numWins: 0,
  // might have to adjust length given amount of guesses
  winsInNumGuesses: [0, 0, 0, 0, 0, 0],
  currentStreak: 0,
  maxStreak: 0,
};

// User's current game state
const gameState = JSON.parse(localStorage.getItem("state")) || {
  gameNumber: -1,
  guesses: [],
  hasWon: false,
};

/*
Game starts, called at beginning of execution
*/

playGame();

function playGame() {
  fetchGameData(getGameNumber());
}

/*
Fetching game data
*/

function fetchGameData(gameNumber) {
  fetch("./games_folder/games.json")
    .then((response) => response.json())
    .then((json) => {
      gameTitle = json[`game-${gameNumber}`].title;
      gameBody = json[`game-${gameNumber}`].body;
      gameNTA = json[`game-${gameNumber}`].NTA;
      gameYTA = json[`game-${gameNumber}`].YTA;
      gameESH = json[`game-${gameNumber}`].ESH;
      gameNAH = json[`game-${gameNumber}`].NAH;
      gameNTACount = json[`game-${gameNumber}`].NTA_Count;
      gameYTACount = json[`game-${gameNumber}`].YTA_Count;
      gameESHCount = json[`game-${gameNumber}`].ESH_Count;
      gameNAHCount = json[`game-${gameNumber}`].NAH_Count;
      gameVerdictSum = json[`game-${gameNumber}`].verdict_sum;
      gameMarginOfError = json[`game-${gameNumber}`].margin_of_error;

      initializeGame();
    });
}

function initializeGame() {
  // Resets game state, adds to game count if new game
  if (gameState.gameNumber !== gameNumber) {
    if (gameState.hasWon === false) {
      userStats.currentStreak = 0;
    }
    gameState.gameNumber = gameNumber;
    gameState.guesses = [];
    gameState.hasWon = false;
    userStats.numGames++;

    localStorage.setItem("stats", JSON.stringify(userStats));
    localStorage.setItem("state", JSON.stringify(gameState));
  }

  displayGame();

  updateGameBoard();

  if (gameState.guesses.length < maxGameLength && !gameState.hasWon) {
    addEventListeners();
  } else {
    convertToShareButton();
  }
}

function displayGame() {
  // Update title and text containers with new game data
  const textContainer = document.getElementById("text-container");

  // Creates new text element to store game's body
  const gameText = document.createElement("p");
  gameText.textContent = gameBody;
  gameText.setAttribute("id", "game-text");

  // Adds created p element to text container
  textContainer.appendChild(gameText);

  // Select game title element and update html to display post title
  const titleContainer = document.getElementById("title-container");
  titleContainer.innerHTML = `<center>${gameTitle}</center>`;
}

function updateGameBoard() {
  updateGuessStat();
}

function updateGuessStat() {
  const guessStats = document.getElementById("game-stats");
  if (gameState.hasWon) {
    guessStats.innerHTML = `<center>You win!</center>`;
    guessStats.innerHTML += `<center>The guesses were asdpofjpoqwier</center>`;
    return;
  }

  if (gameState.guesses.length === maxGameLength) {
    guessStats.innerHTML = `<center>You lost...</center>`;
    guessStats.innerHTML += `<center>The guesses were apsdoijpoqweifi</center>`;
  } else {
    guessStats.innerHTML = `Guess: ${gameState.guesses.length + 1} / ${maxGameLength}`;
  }
}

function convertToShareButton() {
  // TODO
}

function inputEventListener(event) {
  if (event.key === "Enter") {
    handleInput();
  }
}

function buttonEventListener() {
  handleInput();
}

// Input validation to make sure it's a valid number and truncated to 2 digits
function handleInput() {
  const guessNTA = Number(inputNTA.value).toFixed(2);
  const guessYTA = Number(inputYTA.value).toFixed(2);
  const guessESH = Number(inputESH.value).toFixed(2);
  const guessNAH = Number(inputNAH.value).toFixed(2);

  if (
    isNaN(guessNTA) ||
    isNaN(guessYTA) ||
    isNaN(guessESH) ||
    isNaN(guessNAH)
  ) {
    displayWarning();
    return;
  }

  function displayWarning() {
    // TODO
  }

  checkGuess(guessNTA, guessYTA, guessESH, guessNAH);

  inputNTA.value = "";
  inputYTA.value = "";
  inputESH.value = "";
  inputNAH.value = "";
}
