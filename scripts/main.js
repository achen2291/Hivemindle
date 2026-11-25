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
// TODO: Implement switchState function, switches between game view and info view.
infoButton.addEventListener("click", switchState);
// TODO: Implement switchState function, switches between game view and stats view.
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

function getGameNumber() {
  // TODO: Implement logic to get game number based on diff from today and starting date
  return 400;
}

function fetchGameData(gameNumber) {
  fetch("./games_folder/games.json")
    .then((response) => response.json())
    .then((json) => {
      // Current game's post's title
      gameTitle = json[`${gameNumber - 1}`][`game-${gameNumber}`].title;
      // Current game's post's body text
      gameBody = json[`${gameNumber - 1}`][`game-${gameNumber}`].body;
      // Current game's post's NTA, YTA, ESH, NAH percentages
      gameNTA = json[`${gameNumber - 1}`][`game-${gameNumber}`].NTA;
      gameYTA = json[`${gameNumber - 1}`][`game-${gameNumber}`].YTA;
      gameESH = json[`${gameNumber - 1}`][`game-${gameNumber}`].ESH;
      gameNAH = json[`${gameNumber - 1}`][`game-${gameNumber}`].NAH;
      // Current game's post's NTA, YTA, ESH, NAH vote counts
      gameNTACount = json[`${gameNumber - 1}`][`game-${gameNumber}`].NTA_Count;
      gameYTACount = json[`${gameNumber - 1}`][`game-${gameNumber}`].YTA_Count;
      gameESHCount = json[`${gameNumber - 1}`][`game-${gameNumber}`].ESH_Count;
      gameNAHCount = json[`${gameNumber - 1}`][`game-${gameNumber}`].NAH_Count;
      // Current game's post's verdict sum and margin of error
      gameVerdictSum =
        json[`${gameNumber - 1}`][`game-${gameNumber}`].verdict_sum;
      gameMarginOfError =
        json[`${gameNumber - 1}`][`game-${gameNumber}`].margin_of_error;

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
  titleContainer.innerHTML = `<div class="center">${gameTitle}</div>`;
}

function updateGameBoard() {
  updateGuessStat();

  gameState.guesses.forEach((guess, index) => displayGuess(guess, index + 1));
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
  const containerElement = document.getElementById("input-container");
  const shareButtonElement = document.createElement("button");
  shareButtonElement.setAttribute("id", "share-button");
  containerElement.innerHTML = "";
  shareButtonElement.innerHTML = `Share
  <img src="./assets/share-icon.svg" alt="Share Icon" class="share-icon" />`;
  shareButtonElement.addEventListener("click", copyStats);
  containerElement.appendChild(shareButtonElement);
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
  const guessNTA = parseInt(inputNTA.value, 10);
  const guessYTA = parseInt(inputYTA.value);
  const guessESH = parseInt(inputESH.value);
  const guessNAH = parseInt(inputNAH.value);
  console.log("NTA value: " + guessNTA);
  console.log("YTA value: " + guessYTA);
  if (
    isNaN(guessNTA) ||
    isNaN(guessYTA) ||
    isNaN(guessESH) ||
    isNaN(guessNAH)
  ) {
    console.log("here");
    displayWarning();
    console.log("NTA: " + isNaN(guessNTA));
    console.log("YTA: " + isNaN(guessYTA));
    console.log("ESH: " + isNaN(guessESH));
    console.log("NAH: " + isNaN(guessNAH));
    return;
  }

  function displayWarning() {
    clearTimeout(warningTimeout);
    const warningElement = document.getElementById("warning-toast");
    warningElement.classList.remove("hide");
    warningElement.classList.add("animate__flipInX");

    warningTimeout = setTimeout(() => {
      warningElement.classList.remove("animate__flipInX");
      warningElement.classList.add("animate__flipOutX");
      setTimeout(() => {
        warningElement.classList.remove("animate__flipOutX");
        warningElement.classList.add("hide");
      }, 1000);
    }, 2000);
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
    switch (guess.directionNTA) {
      case "&uarr;":
        output += `⬆️`;
        break;
      case "&darr;":
        output += `⬇️`;
        break;
      case "&check;":
        output += `✅ `;
        break;
      default:
        output += `How did you do that`;
        break;
    }

    switch (guess.closenessNTA) {
      case "guess-close":
        output += `🟨 `;
        break;
      case "guess-far":
        output += `🟥 `;
        break;
      default:
        output += `How did you do that for closeness`;
        break;
    }

    switch (guess.directionYTA) {
      case "&uarr;":
        output += `⬆️`;
        break;
      case "&darr;":
        output += `⬇️`;
        break;
      case "&check;":
        output += `✅ `;
        break;
      default:
        output += `How did you do that`;
        break;
    }

    switch (guess.closenessYTA) {
      case "guess-close":
        output += `🟨 `;
        break;
      case "guess-far":
        output += `🟥 `;
        break;
      default:
        output += `How did you do that for closeness`;
        break;
    }

    switch (guess.directionESH) {
      case "&uarr;":
        output += `⬆️`;
        break;
      case "&darr;":
        output += `⬇️`;
        break;
      case "&check;":
        output += `✅ `;
        break;
      default:
        output += `How did you do that`;
        break;
    }

    switch (guess.closenessESH) {
      case "guess-close":
        output += `🟨 `;
        break;
      case "guess-far":
        output += `🟥 `;
        break;
      default:
        output += `How did you do that for closeness`;
        break;
    }

    switch (guess.directionNAH) {
      case "&uarr;":
        output += `⬆️`;
        break;
      case "&darr;":
        output += `⬇️`;
        break;
      case "&check;":
        output += `✅ `;
        break;
      default:
        output += `How did you do that`;
        break;
    }

    switch (guess.closenessNAH) {
      case "guess-close":
        output += `🟨 `;
        break;
      case "guess-far":
        output += `🟥 `;
        break;
      default:
        output += `How did you do that for closeness`;
        break;
    }

    // Decide on a format for output
    // Current format is arrow + closeness for each guess
    // EX: ⬆️🟨 ✅ ⬇️🟥 ⬆️🟨

    output += `\n`;
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

  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }
  if (isMobile()) {
    if (navigator.canShare) {
      navigator
        .share({
          title: "Hivemindle",
          text: output,
          url: "https://hivemindle.com",
        })
        .catch((error) => console.log("Share failed: ", error));
    }
  } else {
    output += `https://hivemindle.com`;
    navigator.clipboard.writeText(output);
    displayToast();
  }

  function displayToast() {
    clearTimeout(toastTimeout);
    const toastElement = document.getElementById("share-toast");
    toastElement.classList.remove("hide");
    toastElement.classList.add("animate__flipInX");

    toastTimeout = setTimeout(() => {
      toastElement.classList.remove("animate__flipInX");
      toastElement.classList.add("animate__flipOutX");
      setTimeout(() => {
        toastElement.classList.remove("animate__flipOutX");
        toastElement.classList.add("hide");
      }, 1000);
    }, 3000);
  }
}

function addEventListeners() {
  inputNTA.addEventListener("keydown", inputEventListener);
  inputYTA.addEventListener("keydown", inputEventListener);
  inputESH.addEventListener("keydown", inputEventListener);
  inputNAH.addEventListener("keydown", inputEventListener);
  buttonInput.addEventListener("click", buttonEventListener);

  inputNTA.addEventListener("focus", () => {
    inputNTA.setAttribute("placeholder", "0");
  });
  inputNTA.addEventListener("blur", () => {
    inputNTA.setAttribute("placeholder", "Enter a guess...");
  });

  inputYTA.addEventListener("focus", () => {
    inputYTA.setAttribute("placeholder", "0");
  });
  inputYTA.addEventListener("blur", () => {
    inputYTA.setAttribute("placeholder", "Enter a guess...");
  });

  inputESH.addEventListener("focus", () => {
    inputESH.setAttribute("placeholder", "0");
  });
  inputESH.addEventListener("blur", () => {
    inputESH.setAttribute("placeholder", "Enter a guess...");
  });

  inputNAH.addEventListener("focus", () => {
    inputNAH.setAttribute("placeholder", "0");
  });
  inputNAH.addEventListener("blur", () => {
    inputNAH.setAttribute("placeholder", "Enter a guess...");
  });
}

function removeEventListeners() {
  buttonInput.setAttribute("disabled", "");
  buttonInput.classList.remove("active");
  buttonInput.removeEventListener("click", buttonEventListener);

  inputNTA.setAttribute("disabled", "");
  inputNTA.setAttribute("placeholder", "Game Over!");
  inputNTA.removeEventListener("keydown", inputEventListener);

  inputYTA.setAttribute("disabled", "");
  inputYTA.setAttribute("placeholder", "Game Over!");
  inputYTA.removeEventListener("keydown", inputEventListener);

  inputESH.setAttribute("disabled", "");
  inputESH.setAttribute("placeholder", "Game Over!");
  inputESH.removeEventListener("keydown", inputEventListener);

  inputNAH.setAttribute("disabled", "");
  inputNAH.setAttribute("placeholder", "Game Over!");
  inputNAH.removeEventListener("keydown", inputEventListener);
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
  // DONE
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

function gameWon() {
  userStats.numWins++;
  userStats.currentStreak++;
  userStats.winsInNumGuesses[gameState.guesses.length - 1]++;
  if (userStats.currentStreak > userStats.maxStreak) {
    userStats.maxStreak = userStats.currentStreak;
  }
  // gameState.hasWon = true;
  localStorage.setItem("state", JSON.stringify(gameState)); //Is this necessary?
  localStorage.setItem("stats", JSON.stringify(userStats));
  removeEventListeners();
  convertToShareButton();
}

function gameLost() {
  userStats.currentStreak = 0;
  localStorage.setItem("stats", JSON.stringify(userStats));
  removeEventListeners();
  convertToShareButton();
}

function displayGuess(guess, index = gameState.guesses.length) {
  // Create containers for each type of guess
  const guessContainerNTA = document.getElementById(index + "NTA");
  const guessContainerYTA = document.getElementById(index + "YTA");
  const guessContainerESH = document.getElementById(index + "ESH");
  const guessContainerNAH = document.getElementById(index + "NAH");

  const guessValueContainerNTA = document.createElement("div");
  const guessValueContainerYTA = document.createElement("div");
  const guessValueContainerESH = document.createElement("div");
  const guessValueContainerNAH = document.createElement("div");

  const infoContainerNTA = document.createElement("div");
  const infoContainerYTA = document.createElement("div");
  const infoContainerESH = document.createElement("div");
  const infoContainerNAH = document.createElement("div");
  // Add classes to containers to animate and add guess to html
  guessValueContainerNTA.classList.add(
    "guess-value-container",
    "animate__flipInX",
  );
  guessValueContainerYTA.classList.add(
    "guess-value-container",
    "animate__flipInX",
  );
  guessValueContainerESH.classList.add(
    "guess-value-container",
    "animate__flipInX",
  );
  guessValueContainerNAH.classList.add(
    "guess-value-container",
    "animate__flipInX",
  );

  infoContainerNTA.classList.add(
    "guess-direction-container",
    "animate__flipInX",
  );
  infoContainerYTA.classList.add(
    "guess-direction-container",
    "animate__flipInX",
  );
  infoContainerESH.classList.add(
    "guess-direction-container",
    "animate__flipInX",
  );
  infoContainerNAH.classList.add(
    "guess-direction-container",
    "animate__flipInX",
  );

  guessValueContainerNTA.innerHTML = `%${guess.guessNTA}`;
  guessValueContainerYTA.innerHTML = `%${guess.guessYTA}`;
  guessValueContainerESH.innerHTML = `%${guess.guessESH}`;
  guessValueContainerNAH.innerHTML = `%${guess.guessNAH}`;

  infoContainerNTA.classList.add(guess.closenessNTA);
  infoContainerYTA.classList.add(guess.closenessYTA);
  infoContainerESH.classList.add(guess.closenessESH);
  infoContainerNAH.classList.add(guess.closenessNAH);

  infoContainerNTA.innerHTML = guess.directionNTA;
  infoContainerYTA.innerHTML = guess.directionYTA;
  infoContainerESH.innerHTML = guess.directionESH;
  infoContainerNAH.innerHTML = guess.directionNAH;

  guessContainerNTA.classList.add("animate__flipInX");
  guessContainerYTA.classList.add("animate__flipInX");
  guessContainerESH.classList.add("animate__flipInX");
  guessContainerNAH.classList.add("animate__flipInX");

  setTimeout(() => {
    guessContainerNTA.classList.add("transparent-background");
    guessContainerYTA.classList.add("transparent-background");
    guessContainerESH.classList.add("transparent-background");
    guessContainerNAH.classList.add("transparent-background");

    guessContainerNTA.appendChild(guessValueContainerNTA);
    guessContainerYTA.appendChild(guessValueContainerYTA);
    guessContainerESH.appendChild(guessValueContainerESH);
    guessContainerNAH.appendChild(guessValueContainerNAH);

    guessContainerNTA.appendChild(infoContainerNTA);
    guessContainerYTA.appendChild(infoContainerYTA);
    guessContainerESH.appendChild(infoContainerESH);
    guessContainerNAH.appendChild(infoContainerNAH);
  }, 500);

  updateGuessStat();
}

function shakeBox() {
  clearTimeout(shakeTimeout);
  const infoCard = document.getElementById("info-card");
  if (infoCard.classList.contains("animate__headShake")) {
    infoCard.classList.remove("animate__headShake");
  }
  shakeTimeout = setTimeout(
    () => infoCard.classList.add("animate__headShake"),
    100,
  );
}

function switchState(event) {
  const overlayButtonClicked = event.currentTarget.dataset.overlay;
  const overlayElement = document.getElementById(overlayButtonClicked);
  const title = document.getElementById("title");

  if (title.classList.contains("info-title")) {
    title.classList.remove("info-title");
  }

  if (overlayElement.style.display === "flex") {
    title.innerHTML = `HIVEMINDLE`;
    overlayElement.style.display = "none";
    return;
  }

  if (overlayButtonClicked === "info-overlay") {
    document.getElementById("stats-overlay").style.display = "none";
    renderInfo();
  } else {
    document.getElementById("info-overlay").style.display = "none";
    renderStats();
  }

  function renderInfo() {
    title.innerHTML = `HOW TO PLAY`;
    overlayElement.style.display = "flex";
    if (!title.classList.contains("info-title")) {
      title.classList.add("info-title");
    }
  }

  function renderStats() {
    title.innerHTML = `GAME STATS`;
    overlayElement.style.display = "flex";
    renderGameStats();
    graphDistribution();

    function renderGameStats() {
      const numGamesElement = document.getElementById("num-games");
      numGamesElement.innerHTML = `${userStats.numGames}`;

      const winPercentageElement = document.getElementById("win-percentage");
      if (userStats.numGames === 0) {
        winPercentageElement.innerHTML = `0`;
      } else {
        winPercentageElement.innerHTML = `${Math.round(userStats.numWins / userStats.numGames) * 100}`;
      }

      const currentStreakElement = document.getElementById("current-streak");
      currentStreakElement.innerHTML = `${userStats.currentStreak}`;

      const maxStreakElement = document.getElementById("max-streak");
      maxStreakElement.innerHTML = `${userStats.maxStreak}`;
    }

    function graphDistribution() {
      userStats.winsInNumGuesses.forEach((numGuesses, index) => {
        const graphBarElement = document.getElementById(`guess-${index + 1}`);
        if (userStats.numWins === 0) {
          graphBarElement.style.width = `5%`;
        } else {
          graphBarElement.style.width = `${Math.floor((numGuesses / userStats.numWins) * 95.0) + 5}%`;
        }
        graphBarElement.innerHTML = `${numGuesses}`;
      });
    }
  }
}
