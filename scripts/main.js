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
const gameCloseThreshold = 10;

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
      // Current game's post's title
      gameTitle = json[`game-${gameNumber}`].title;
      // Current game's post's body text
      gameBody = json[`game-${gameNumber}`].body;
      // Current game's post's NTA, YTA, ESH, NAH percentages
      gameNTA = json[`game-${gameNumber}`].NTA;
      gameYTA = json[`game-${gameNumber}`].YTA;
      gameESH = json[`game-${gameNumber}`].ESH;
      gameNAH = json[`game-${gameNumber}`].NAH;
      // Current game's post's NTA, YTA, ESH, NAH vote counts
      gameNTACount = json[`game-${gameNumber}`].NTA_Count;
      gameYTACount = json[`game-${gameNumber}`].YTA_Count;
      gameESHCount = json[`game-${gameNumber}`].ESH_Count;
      gameNAHCount = json[`game-${gameNumber}`].NAH_Count;
      // Current game's post's verdict sum and margin of error
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
  const guessNTA = parseInt(inputNTA.value);
  const guessYTA = parseInt(inputYTA.value);
  const guessESH = parseInt(inputESH.value);
  const guessNAH = parseInt(inputNAH.value);

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

function copyStats() {
  let output = `Hivemindle #${gameNumber}`;
  if (!gameState.hasWon) {
    output += `X/${maxGameLength}\n`;
  } else {
    output += `${gameState.guesses.length}/${maxGameLength}\n`;
  }

  gameState.guesses.forEach((guess) => {
    /* guess object should be 
    {
      NTAGuess, closeness, direction
      YTAGuess, closeness, direction
      ESHGuess, closeness, direction
      NAHGuess, closeness, direction
    }

    After that, for each guess in gamestate guesses list, 
    if guess.NTAGuess is up, output upArrow for NTAGuess
    if guess.NTAGuess is down, output downArrow for NTAGuess
    repeat for YTA, ESH, NAH

    each guess needs closeness check also
    */
  });
}

function addEventListeners() {
  input.addEventListener("keydown", inputEventListener);
  buttonInput.addEventListener("click", buttonEventListener);

  input.addEventListener("focus", () => {
    input.setAttribute("placeholder", "0");
  });
  input.addEventListener("blur", () => {
    input.setAttribute("placeholder", "Enter a guess...");
  });
}

function removeEventListener() {
  buttonInput.setAttribute("disabled", "");
  buttonInput.classList.remove("active");
  input.setAttribute("disabled", "");
  input.setAttribute("placeholder", "Game Over!");
  input.removeEventListener("keydown", inputEventListener);
  buttonInput.removeEventListener("click", buttonEventListener);
}

function checkGuess(guessNTA, guessYTA, guessESH, guessNAH) {
  const guessObj = {
    guessNTA,
    closenessNTA: "",
    directionNTA: "",
    guessYTA,
    closenessYTA: "",
    directionYTA: "",
    guessESH,
    closenessESH: "",
    directionESH: "",
    guessNAH,
    closenessNAH: "",
    directionNAH: "",
  };

  // Calculate difference between guess and answer
  const guessDiffNTA = calculateDiff(guessNTA, gameNTA);
  const guessDiffYTA = calculateDiff(guessYTA, gameYTA);
  const guessDiffESH = calculateDiff(guessESH, gameESH);
  const guessDiffNAH = calculateDiff(guessNAH, gameNAH);

  // if NTA guess is within margin of error, guess is correct, assign check to direction
  if (Math.abs(guessDiffNTA) <= gameMarginOfError) {
    guessObj.closenessNTA = "guess-correct";
    guessObj.directionNTA = "&check;";
  } else {
    // else shake box to let user know it was wrong
    shakeBox();
    // assign direction based on if diff was greater or less than zero
    // if guessDiffNTA (guess - answer) is greater than zero, then the guess was too high so assign down arrow
    // otherwise, guessDiffNTA must be less than zero so assign up arrow because guess was too low
    if (guessDiffNTA > 0) {
      guessObj.directionNTA = "&darr;";
    } else {
      guessObj.directionNTA = "&uarr;";
    }
    // if guess is within close threshold (10), then mark it as close, otherwise far
    if (Math.abs(guessDiffNTA) <= gameCloseThreshold - gameMarginOfError) {
      guessObj.closenessNTA = "guess-close";
    } else {
      guessObj.closenessNTA = "guess-far";
    }
  }
  // repeat for YTA guess
  if (Math.abs(guessDiffYTA) <= gameMarginOfError) {
    guessObj.closenessYTA = "guess-correct";
    guessObj.directionYTA = "&check;";
  } else {
    shakeBox();
    if (guessDiffYTA > 0) {
      guessObj.directionYTA = "&darr;";
    } else {
      guessObj.directionYTA = "&uarr;";
    }
    if (Math.abs(guessDiffYTA) <= gameCloseThreshold - gameMarginOfError) {
      guessObj.closenessYTA = "guess-close";
    } else {
      guessObj.closenessYTA = "guess-far";
    }
  }
  // repeat for ESH guess
  if (Math.abs(guessDiffESH) <= gameMarginOfError) {
    guessObj.closenessESH = "guess-correct";
    guessObj.directionESH = "&check;";
  } else {
    shakeBox();
    if (guessDiffESH > 0) {
      guessObj.directionESH = "&darr;";
    } else {
      guessObj.directionESH = "&uarr;";
    }
    if (Math.abs(guessDiffESH) <= gameCloseThreshold - gameMarginOfError) {
      guessObj.closenessESH = "guess-close";
    } else {
      guessObj.closenessESH = "guess-far";
    }
  }
  // repeat for NAH guess
  if (Math.abs(guessDiffNAH) <= gameMarginOfError) {
    guessObj.closenessNAH = "guess-correct";
    guessObj.directionNAH = "&check;";
  } else {
    shakeBox();
    if (guessDiffNAH > 0) {
      guessObj.directionNAH = "&darr;";
    } else {
      guessObj.directionNAH = "&uarr;";
    }
    if (Math.abs(guessDiffNAH) <= gameCloseThreshold - gameMarginOfError) {
      guessObj.closenessNAH = "guess-close";
    } else {
      guessObj.closenessNAH = "guess-far";
    }
  }
  // all guesses assigned closeness and direction vals
  if (
    guessObj.closenessNTA === "guess-correct" &&
    guessObj.closenessYTA === "guess-correct" &&
    guessObj.closenessESH === "guess-correct" &&
    guessObj.closenessNAH === "guess-correct"
  ) {
    gameState.hasWon = true;
  }

  gameState.guesses.push(guessObj);
  localStorage.setItem("state", JSON.stringify(gameState));

  // TODO: Implement displayGuess function
  displayGuess(guessObj);
  // TODO: implement gameWon and gameLost functions
  if (gameState.hasWon) {
    gameWon();
  } else if (gameState.guesses.length === maxGameLength) {
    gameLost();
  }
}

// Helper function to calculate diff
function calculateDiff(guess, answer) {
  return guess - answer;
}
