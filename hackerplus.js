const gameBoard = document.getElementById("gameboard");
const width = 8;
const allSquares = gameBoard.querySelectorAll(".square");
const playerDisplay = document.querySelector("#turnspan");
const leftBtn = document.querySelector("#left");
const rightBtn = document.querySelector("#right");
const resetButton = document.querySelector("#reset");
const pauseButton = document.querySelector("#pause");
const resumeButton = document.querySelector("#resume");
const pausePopup = document.querySelector("#pause-popup");
const winnerNotice = document.querySelector("#winner-notice");
const playAgainBtn = document.querySelector("#play-again");
const undoButton = document.querySelector("#undo");
const redoButton = document.querySelector("#redo");
const gameHistoryBoard = document.querySelector("#game-state-history");
const replayButton = document.querySelector("#replay");

const timer = document.querySelector("#timertext");

let highlightedSquares = [];
let selectedPiece = null;
let currentPlayer = "green";
let ricochetRotation = {};
let bulletDirection = "";
let cannonCoords;
let bulletSpeed = 150;
let remainingSeconds = 21;
let timerId = null;
let gameStateHistory = [];
let redoStack = [];
let whoWon = "";
let moveCount = 1;

//bools
let gameOver = false;
let gamePaused = false;
let isBulletMoving = false;
rightBtn.disabled = true;
leftBtn.disabled = true;

// Sounds

var cannonAudio = new Audio("audio/cannon.mp3");
var ricochetAudio = new Audio("audio/ricohit.mp3");
var gameOverAudio = new Audio("audio/gameover.mp3");
var otherPieces = new Audio("audio/punch.mp3");
var overallAudio = new Audio("audio/overall.mp3");
var pauseAudio = new Audio("audio/pause.mp3");
var playAudio = new Audio("audio/play.mp3");

startPieces = randomOpening();
initialPieces = randomOpening();

window.addEventListener("click", () => {
  if (!gamePaused && !gameOver) {
    overallAudio.play();
    overallAudio.loop = true;
    overallAudio.volume = 0.2;
  }
});

let bulletDiv = document.createElement("div");
bulletDiv.classList.add("bullet");
bulletDiv.innerHTML = directionalBullet;

playerDisplay.innerText = "green's";

function setRicoRotation() {
  for (i = 0; i < width * width; i++) {
    ricochetRotation[i] = 0;
  }
}
setRicoRotation();
function equatePieces() {
  initialPieces = randomOpening();
  for (i = 0; i < width * width; i++) {
    startPieces[i] = initialPieces[i];
    // console.log(`${startPieces[i]} ${i}`);
  }
}
function updateTimer() {
  if (!gamePaused && !gameOver) {
    remainingSeconds--;
    if (remainingSeconds < 10) {
      timer.innerHTML = "00:0" + remainingSeconds;
    } else {
      timer.innerHTML = "00:" + remainingSeconds;
    }

    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      timer.innerHTML = "00:00";
      // Player loses if the timer runs out
      handlePlayerLossByTime(currentPlayer);
    }
  }
}

function startTimer() {
  if (timerId) clearInterval(timerId);
  // remainingSeconds = 21;
  // timer.innerHTML = "00:21";
  timerId = setInterval(updateTimer, 1000);
}

startTimer();
function pauseGame() {
  if (!isBulletMoving) {
    gamePaused = true;
    clearInterval(timerId); // Stop the timer
    pausePopup.style.visibility = "visible";
    pauseButton.disabled = true;
    overallAudio.pause();
    pauseAudio.play();
  }
}

function resumeGame() {
  gamePaused = false;
  pausePopup.style.visibility = "hidden";
  pauseButton.disabled = false;
  startTimer(); // Start the timer
  setTimeout(() => {
    overallAudio.play();
    overallAudio.loop = true;
    overallAudio.volume = 0.2;
  }, 1300);
  playAudio.play();
}

function resetGame() {
  if (!isBulletMoving) {
    gameOver = false;
    gamePaused = false;
    isBulletMoving = false;
    remainingSeconds = 21; // Reset the timer
    timer.innerHTML = "00:21";
    startTimer(); // Start the timer
    playerDisplay.innerText = "green's";
    currentPlayer = "green";
    selectedPiece = null;
    highlightedSquares = [];
    gameBoard.innerHTML = "";
    equatePieces();
    setRicoRotation();
    createBoard();
    rightBtn.disabled = true;
    leftBtn.disabled = true;
    pauseButton.disabled = false;
    winnerNotice.style.visibility = "hidden";
    overallAudio.play();
    overallAudio.loop = true;
    overallAudio.volume = 0.4;
    localStorage.removeItem("gameStateHistory");
    localStorage.removeItem("whoWon");
    gameStateHistory = [];
    moveCount = 1;
    gameHistoryBoard.innerHTML = "";
    document.getElementById("whose-turn").style.visibility = "visible";
  }
}

function gameWin(element, currentLocation) {
  saveGameState();
  currentLocation.removeChild(bulletDiv);

  // console.log("game over");
  gameOver = true;
  isBulletMoving = false;
  pauseButton.disabled = true;
  if (element.firstElementChild.classList.contains("blue")) {
    document.getElementById("winner-text").textContent = "Green Won!";
    whoWon = "green";
  } else {
    document.getElementById("winner-text").textContent = "Blue Won!";
    whoWon = "blue";
  }
  localStorage.setItem("whoWon", JSON.stringify(whoWon));
  element.innerHTML = "";
  element.innerHTML = gameOverCoin;
  winnerNotice.style.visibility = "visible";
  overallAudio.pause();
  gameOverAudio.play();
  saveGameStateHistoryToLocal();
}
function playAgain() {
  winnerNotice.style.visibility = "hidden";
  resetGame();
  localStorage.removeItem("gameStateHistory");
}
function handlePlayerLossByTime(player) {
  saveGameState();
  gameOver = true;

  isBulletMoving = false;
  clearInterval(timerId); // Stop the timer
  pauseButton.disabled = true;

  if (player === "green") {
    document.getElementById("winner-text").textContent = "Time Over: Blue Won!";
    whoWon = "blue";
  } else {
    document.getElementById("winner-text").textContent =
      "Time Over: Green Won!";
    whoWon = "green";
  }
  localStorage.setItem("whoWon", JSON.stringify(whoWon));

  winnerNotice.style.visibility = "visible";
  overallAudio.pause();
  gameOverAudio.play();
  saveGameStateHistoryToLocal();
}

function changePlayer() {
  if (currentPlayer === "green") {
    currentPlayer = "blue";
    playerDisplay.innerText = "blue's";
  } else {
    currentPlayer = "green";
    playerDisplay.innerText = "green's";
  }
  remainingSeconds = 21;
  timer.innerHTML = "00:21";
  startTimer(); // Reset and start the timer for the new player
}
function saveGameState() {
  const gameState = {
    pieces: [...startPieces],
    rotation: { ...ricochetRotation },
    currentPlayer: currentPlayer,
    remainingSeconds: remainingSeconds,
    cannonShoot: true,
  };
  gameStateHistory.push(gameState);
  if (redoStack.length > 0) {
    redoStack = []; // Clear the redo stack if a new move is made
  }
  console.log("New move made: redoStack cleared");
  console.log("Current gameStateHistory:", gameStateHistory);
}

function undoLastMove() {
  if (
    gameStateHistory.length > 0 &&
    !isBulletMoving &&
    !gamePaused &&
    !gameOver
  ) {
    const lastGameState = gameStateHistory.pop();
    redoStack.push({
      pieces: [...startPieces],
      rotation: { ...ricochetRotation },
      currentPlayer: currentPlayer,
      remainingSeconds: remainingSeconds,
    });
    console.log("Undo: Current state pushed to redoStack:", redoStack);
    startPieces = lastGameState.pieces;
    ricochetRotation = lastGameState.rotation;
    currentPlayer = lastGameState.currentPlayer;
    remainingSeconds = lastGameState.remainingSeconds;
    logMove("Undo");
    playerDisplay.innerText = `${currentPlayer}'s`;
    updateBoard();
  }
}

function redoLastMove() {
  if (redoStack.length > 0 && !isBulletMoving && !gamePaused && !gameOver) {
    const redoGameState = redoStack.pop();
    gameStateHistory.push({
      pieces: [...startPieces],
      rotation: { ...ricochetRotation },
      currentPlayer: currentPlayer,
      remainingSeconds: remainingSeconds,
    });
    console.log(
      "Redo: Current state pushed to gameStateHistory:",
      gameStateHistory
    );
    startPieces = redoGameState.pieces;
    ricochetRotation = redoGameState.rotation;
    currentPlayer = redoGameState.currentPlayer;
    remainingSeconds = redoGameState.remainingSeconds;
    logMove("Redo");
    playerDisplay.innerText = `${currentPlayer}'s`;
    updateBoard();
  }
}

function saveGameStateHistoryToLocal() {
  localStorage.setItem("gameStateHistory", JSON.stringify(gameStateHistory));
}

function loadGameStateHistoryFromLocal() {
  const savedGameStateHistory = localStorage.getItem("gameStateHistory");
  if (savedGameStateHistory) {
    return JSON.parse(savedGameStateHistory);
  } else {
    return [];
  }
}

function replayGame() {
  const history = loadGameStateHistoryFromLocal();
  winnerNotice.style.visibility = "hidden";
  if (history.length === 0) {
    alert("No game history found for replay.");
    return;
  }

  let index = 0;

  function replayNextMove() {
    if (index < history.length-1) {
      const gameState = history[index];
      startPieces = gameState.pieces;
      ricochetRotation = gameState.rotation;
      currentPlayer = gameState.currentPlayer;
      document.getElementById("whose-turn").style.visibility = "hidden";
      updateBoard();
      index++;

      // Check if it's Green's turn to move a piece and shoot
      if (currentPlayer === "green") {
        movePieceAndShoot("green").then(replayNextMove);
      } else {
        // Blue's turn
        movePieceAndShoot("blue").then(replayNextMove);
      }
    }
  }

  replayNextMove();
}

function movePieceAndShoot(player) {
  return new Promise((resolve) => {
    // Move the piece for the player
    movePlayerPiece(player).then(() => {
      // Handle cannon shoot for the player after moving the piece
      handleCannonShoot(player);
      resolve();
    });
  });
}

function movePlayerPiece(player) {
  return new Promise((resolve) => {
    // Perform the piece movement logic here
    // For demonstration purposes, let's assume the movement takes 2 seconds
    setTimeout(() => {
      // Update the board after moving the piece
      updateBoard();
      resolve();
    }, 4000); // Adjust delay time as needed
  });
}

function logMove(description) {
  const movesBoardChild = document.createElement("div");
  movesBoardChild.classList.add("moves-board-child");
  movesBoardChild.textContent = description;
  gameHistoryBoard.append(movesBoardChild);
}
resetButton.addEventListener("click", resetGame);
pauseButton.addEventListener("click", pauseGame);
resumeButton.addEventListener("click", resumeGame);
playAgainBtn.addEventListener("click", playAgain);
undoButton.addEventListener("click", undoLastMove);
redoButton.addEventListener("click", redoLastMove);
replayButton.addEventListener("click", replayGame);

function createBoard() {
  startPieces.forEach((startPiece, i) => {
    const square = document.createElement("div");
    square.classList.add("square");
    square.innerHTML = startPiece;

    const row = Math.floor(i / width);
    const column = i % width;

    square.setAttribute("square-id", `${row}${column}`);

    const currentPosition = row * width + column;
    square.style.transform = `rotate(${ricochetRotation[currentPosition]}deg)`;
    // ricochetRotation[currentPosition] = 0;

    gameBoard.append(square);
  });
}

createBoard();

function handlePieceMove(event) {
  if (selectedPiece) {
    const row = parseInt(event.target.getAttribute("square-id")[0]);
    const column = parseInt(event.target.getAttribute("square-id")[1]);
    movePiece(selectedPiece.row, selectedPiece.column, row, column);
  }
}

function handleCannonMove(event) {
  if (selectedPiece) {
    const row = parseInt(event.target.getAttribute("square-id")[0]);
    const column = parseInt(event.target.getAttribute("square-id")[1]);
    moveCannon(selectedPiece.row, selectedPiece.column, row, column);
  }
}

function handleRicochetMove(event) {
  if (selectedPiece) {
    const row = parseInt(event.target.getAttribute("square-id")[0]);
    const column = parseInt(event.target.getAttribute("square-id")[1]);
    moveRicochet(selectedPiece.row, selectedPiece.column, row, column);
  }
}

// ---------------------------------------- PRIMARY EVENT LISTENER-----------------------------------------------
gameBoard.addEventListener("click", (e) => {
  if (!gameOver) {
    if (!gamePaused) {
      if (e.target.classList.contains(currentPlayer)) {
        if (!isBulletMoving) {
          const parentNode = e.target.parentNode;
          // console.log(e.target);
          // console.log(e.target.getAttribute("pieceName"));
          if (parentNode) {
            const boxId = parentNode.getAttribute("square-id");
            if (boxId) {
              const row = parseInt(boxId[0]);
              const column = parseInt(boxId[1]);
              const pieceName = e.target.getAttribute("pieceName");
              const piece = startPieces[row * width + column];
              if (piece !== "") {
                selectedPiece = { row, column, pieceName }; // Set selectedPiece
                if (piece === topCannon || piece === bottomCannon) {
                  highlightCannonBoxes(row, column);
                } else if (
                  piece === topRicochet ||
                  piece === bottomRicochet ||
                  piece === topSemiRicochet ||
                  piece === bottomSemiRicochet
                ) {
                  highlightRicochetPieces(row, column);
                } else {
                  highlightOtherPieces(row, column);
                }
              } else {
                selectedPiece = null; // to Reset selectedPiece if the clicked square is empty
              }
            }
          }
        }
      }
    }
  }
});

function clearHighlightedSquares() {
  highlightedSquares.forEach((square) => {
    square.style.background = ""; // Clear the background color
    square.removeEventListener("click", handlePieceMove); // Remove the click event listener for regular pieces
    square.removeEventListener("click", handleCannonMove); // Remove the click event listener for cannons
    square.removeEventListener("click", handleRicochetMove); // Remove the click event listener for ricochets
  });
  highlightedSquares = [];
}

function highlightOtherPieces(row, column) {
  rightBtn.disabled = true;
  leftBtn.disabled = true;
  clearHighlightedSquares();

  const directions = [
    { row: -1, column: 0 }, // Up
    { row: 1, column: 0 }, // Down
    { row: 0, column: -1 }, // Left
    { row: 0, column: 1 }, // Right
    { row: -1, column: -1 }, // Up-Left
    { row: -1, column: 1 }, // Up-Right
    { row: 1, column: -1 }, // Down-Left
    { row: 1, column: 1 }, // Down-Right
  ];

  directions.forEach((direction) => {
    const newRow = row + direction.row;
    const newColumn = column + direction.column;
    if (isValidPosition(newRow, newColumn)) {
      const newPosition = gameBoard.querySelector(
        `[square-id="${newRow}${newColumn}"]`
      );
      if (startPieces[newRow * width + newColumn] === "") {
        newPosition.style.background = "#3b81199c";
        newPosition.addEventListener("click", handlePieceMove);
        // Add the highlighted square to the array
        highlightedSquares.push(newPosition);
      }
    }
  });
}

function highlightRicochetPieces(row, column) {
  clearHighlightedSquares();

  const directions = [
    { row: -1, column: 0 }, // Up
    { row: 1, column: 0 }, // Down
    { row: 0, column: -1 }, // Left
    { row: 0, column: 1 }, // Right
    { row: -1, column: -1 }, // Up-Left
    { row: -1, column: 1 }, // Up-Right
    { row: 1, column: -1 }, // Down-Left
    { row: 1, column: 1 }, // Down-Right
  ];

  const currentPosition = gameBoard.querySelector(
    `[square-id="${row}${column}"]`
  );
  // console.log(currentPosition);

  directions.forEach((direction) => {
    const newRow = row + direction.row;
    const newColumn = column + direction.column;
    if (isValidPosition(newRow, newColumn)) {
      const newPosition = gameBoard.querySelector(
        `[square-id="${newRow}${newColumn}"]`
      );
      if (startPieces[newRow * width + newColumn] === "") {
        newPosition.style.background = "#3b81199c";
        newPosition.addEventListener("click", handleRicochetMove);
        highlightedSquares.push(newPosition);
      }
    }
  });

  enableRotationButtons(currentPosition);
}
// Define event listener functions
const rotateLeftHandler = () => handleRotationClick(-90);
const rotateRightHandler = () => handleRotationClick(90);

function enableRotationButtons(currentPosition) {
  rightBtn.disabled = false;
  leftBtn.disabled = false;
  // Add event listeners using the defined functions
  leftBtn.addEventListener("click", rotateLeftHandler);
  rightBtn.addEventListener("click", rotateRightHandler);
}

function handleRotationClick(degrees) {
  saveGameState();
  const currentPosition = selectedPiece.row * width + selectedPiece.column;

  // Set the rotation angle to the provided degrees
  ricochetRotation[currentPosition] += degrees;
  ricochetRotation[currentPosition] %= 360;
  if (ricochetRotation[currentPosition] < 0) {
    ricochetRotation[currentPosition] += 360;
  }
  // console.log(ricochetRotation[currentPosition]);
  const toRotatePiece = gameBoard.querySelector(
    `[square-id="${selectedPiece.row}${selectedPiece.column}"]`
  );
  toRotatePiece.style.transform = `rotate(${ricochetRotation[currentPosition]}deg)`;
  clearHighlightedSquares();

  // Remove event listeners using the defined functions
  leftBtn.removeEventListener("click", rotateLeftHandler);
  rightBtn.removeEventListener("click", rotateRightHandler);
  rightBtn.disabled = true;
  leftBtn.disabled = true;

  logMove(
    `${currentPlayer.toUpperCase()}: Rotated ${
      selectedPiece.pieceName
    } by ${degrees} degrees`
  );
  handleCannonShoot(currentPlayer);
  updateBoard();
}

function isValidPosition(row, column) {
  return row >= 0 && row < width && column >= 0 && column < width;
}

function movePiece(oldRow, oldColumn, newRow, newColumn) {
  saveGameState();
  startPieces[newRow * width + newColumn] =
    startPieces[oldRow * width + oldColumn];
  startPieces[oldRow * width + oldColumn] = "";

  // Log the move with the piece name
  logMove(
    `${currentPlayer.toUpperCase()}: Moved ${selectedPiece.pieceName} from (${
      oldRow + 1
    }, ${oldColumn + 1}) to (${newRow + 1}, ${newColumn + 1})`
  );

  handleCannonShoot(currentPlayer);
  updateBoard();
}

function highlightCannonBoxes(row, column) {
  const leftColumn = column - 1;
  const rightColumn = column + 1;

  rightBtn.disabled = true;
  leftBtn.disabled = true;

  clearHighlightedSquares();

  if (leftColumn >= 0 && startPieces[row * width + leftColumn] === "") {
    const leftBox = gameBoard.querySelector(
      `[square-id="${row}${leftColumn}"]`
    );
    leftBox.style.background = "#3b81199c";
    leftBox.addEventListener("click", handleCannonMove);
    highlightedSquares.push(leftBox);
  }

  if (rightColumn < width && startPieces[row * width + rightColumn] === "") {
    const rightBox = gameBoard.querySelector(
      `[square-id="${row}${rightColumn}"]`
    );
    rightBox.style.background = "#3b81199c";
    rightBox.addEventListener("click", handleCannonMove);
    highlightedSquares.push(rightBox);
  }
}

function moveCannon(oldRow, oldColumn, newRow, newColumn) {
  saveGameState();
  const oldIndex = oldRow * width + oldColumn;
  const newIndex = newRow * width + newColumn;

  startPieces[oldIndex] = "";

  if (oldRow === 0) {
    startPieces[newIndex] = topCannon;
  } else {
    startPieces[newIndex] = bottomCannon;
  }

  logMove(
    `${currentPlayer.toUpperCase()}: Moved ${selectedPiece.pieceName} from (${
      oldRow + 1
    }, ${oldColumn + 1}) to (${newRow + 1}, ${newColumn + 1})`
  );
  updateBoard();
  handleCannonShoot(currentPlayer);
  updateBoard();
}

function moveRicochet(oldRow, oldColumn, newRow, newColumn) {
  saveGameState();
  const oldIndex = oldRow * width + oldColumn;
  const newIndex = newRow * width + newColumn;

  // Move the piece
  startPieces[newIndex] = startPieces[oldIndex];
  startPieces[oldIndex] = "";

  // to Retain rotation state
  ricochetRotation[newIndex] = ricochetRotation[oldIndex];
  ricochetRotation[oldIndex] = 0;

  rightBtn.disabled = true;
  leftBtn.disabled = true;

  logMove(
    `${currentPlayer.toUpperCase()}: Moved ${selectedPiece.pieceName} from (${
      oldRow + 1
    }, ${oldColumn + 1}) to (${newRow + 1}, ${newColumn + 1})`
  );
  handleCannonShoot(currentPlayer);

  // Update board
  updateBoard();
}

function updateBoard() {
  gameBoard.innerHTML = "";
  createBoard();
  // updateRicochetRotation(); // Uncomment this line to update the rotation of ricochet pieces
}

// console.log(currentPlayer);

function handleCannonShoot(currentPlayer) {
  // console.log(currentPlayer);
  if (currentPlayer == "green") {
    cannonCoords = document
      .getElementById("bottomCanon")
      .parentNode.getAttribute("square-id");
    bulletDirection = "up";
    bulletDiv.style.transform = "rotate(0deg)";
    // console.log(cannonCoords);
  } else {
    cannonCoords = document
      .getElementById("topCannon")
      .parentNode.getAttribute("square-id");
    bulletDirection = "down";
    bulletDiv.style.transform = "rotate(180deg)";
  }
  //--
  // bulletDirection = row === 0 ? "down" : "up";
  //--
  shootBullet(
    parseInt(cannonCoords[0]),
    parseInt(cannonCoords[1]),
    bulletDirection
  );
  cannonAudio.play();
}

function shootBullet(row, column, bulletDirection) {
  let location = gameBoard.querySelector(`[square-id="${row}${column}"]`);

  location.appendChild(bulletDiv);

  moveBullet(location, row, column, bulletDirection);
}

function moveBullet(location, row, column, bulletDirection) {
  bulletDiv.classList = "bullet";

  switch (bulletDirection) {
    case "right":
      if (bulletDiv.parentNode.childNodes.length == 1)
        bulletDiv.classList.add("dirBulletRightAnime");
      break;
    case "left":
      if (bulletDiv.parentNode.childNodes.length == 1)
        bulletDiv.classList.add("dirBulletLeftAnime");
      break;
    case "up":
      if (bulletDiv.parentNode.childNodes.length == 1)
        bulletDiv.classList.add("dirBulletUpAnime");
      break;
    case "down":
      if (bulletDiv.parentNode.childNodes.length == 1)
        bulletDiv.classList.add("dirBulletDownAnime");
      break;
    default:
      break;
  }

  setTimeout(() => {
    let newRow = row;
    let newColumn = column;
    switch (bulletDirection) {
      case "right":
        newColumn++;
        break;
      case "left":
        newColumn--;
        break;
      case "up":
        newRow--;
        break;
      case "down":
        newRow++;
        break;
      default:
        break;
    }

    const newBox = gameBoard.querySelector(
      `[square-id="${newRow}${newColumn}"]`
    );
    if (newBox) {
      if (newBox.innerHTML !== "") {
        handleBulletCollision(
          newBox,
          newRow,
          newColumn,
          location,
          currentPlayer
        );
        return;
      } else {
        newBox.appendChild(bulletDiv);
        location = newBox;
        isBulletMoving = true;
        moveBullet(location, newRow, newColumn, bulletDirection);
      }
    } else {
      location.removeChild(bulletDiv);
      isBulletMoving = false;
      changePlayer();
    }
  }, bulletSpeed);
}

function handleBulletCollision(
  element,
  newRow,
  newColumn,
  currentLocation,
  currentPlayer
) {
  // console.log("collided with", element.children[0].id);
  if (
    element.children[0].id == "topCannon" ||
    element.children[0].id == "bottomCanon"
  ) {
    // console.log("hit", element.children[0].id);
    currentLocation.removeChild(bulletDiv);
    isBulletMoving = false;
    changePlayer();
    otherPieces.play();
  } else if (element.children[0].id == "tank") {
    handleTankCollision(element, newRow, newColumn, currentLocation);
  } else if (element.children[0].id == "titan") {
    gameWin(element, currentLocation);
  } else if (element.children[0].id == "semiRicochet") {
    bulletDiv.classList = "bullet";
    console.log(bulletDiv.classList);
    handleSemiRicochetCollision(element, newRow, newColumn, currentLocation);
    ricochetAudio.play();
  } else if (element.children[0].id == "ricochet") {
    bulletDiv.classList = "bullet";
    console.log(bulletDiv.classList);
    handleRicochetCollision(element, newRow, newColumn, currentLocation);
    ricochetAudio.play();
  }
}
function removeBullet(location) {
  location.removeChild(bulletDiv);
  isBulletMoving = false;
  changePlayer();
}
function handleTankCollision(element, newRow, newColumn, currentLocation) {
  if (element.children[0].id === "tank") {
    if (bulletDirection === "down" || bulletDirection === "up") {
      // console.log("hi");
      removeBullet(currentLocation);
    } else if (bulletDirection === "right" || bulletDirection === "left") {
      shootBullet(newRow, newColumn, bulletDirection);
    }
  }
}

function handleSemiRicochetCollision(element, newRow, newColumn, location) {
  bulletDiv.classList = "bullet";
  // console.log(element.style.transform);
  // console.log(bulletDirection);

  // console.log(element);
  const oldBulletDirection = bulletDirection;
  if (element.style.transform === "rotate(0deg)") {
    // console.log(location);
    if (bulletDirection === "down") {
      bulletDirection = "left";
    } else if (bulletDirection === "right") {
      bulletDirection = "up";
    } else {
      isBulletMoving = false;
    }
  } else if (element.style.transform === "rotate(90deg)") {
    if (bulletDirection === "down") {
      bulletDirection = "right";
    } else if (bulletDirection === "left") {
      bulletDirection = "up";
    } else {
      isBulletMoving = false;
    }
  } else if (element.style.transform === "rotate(180deg)") {
    if (bulletDirection === "up") {
      bulletDirection = "right";
    } else if (bulletDirection === "left") {
      bulletDirection = "down";
    } else {
      isBulletMoving = false;
    }
  } else if (element.style.transform === "rotate(270deg)") {
    if (bulletDirection === "up") {
      bulletDirection = "left";
    } else if (bulletDirection === "right") {
      bulletDirection = "down";
    } else {
      isBulletMoving = false;
    }
  }

  if (!isBulletMoving) {
    removeBullet(location);
    deleteSemiRicochet(element);
    return;
  } else {
    shootBullet(newRow, newColumn, bulletDirection);
    rotateDirBullet(oldBulletDirection); 
  }
}
function deleteSemiRicochet(element) {
  // console.log(element.children[0].classList);
  const lostPiece = element.children[0].classList.contains("blue")
    ? "blue"
    : "green";
  // console.log(lostPiece);
  // Clear the content of the square
  element.innerHTML = "";

  // Get the row and column of the square
  const row = parseInt(element.getAttribute("square-id")[0]);
  const column = parseInt(element.getAttribute("square-id")[1]);

  // Update the startPieces array to remove the semi-ricochet from the specified position
  startPieces[row * width + column] = "";
  ricochetRotation[row * width + column] = 0;

  logMove(
    `${lostPiece.toUpperCase()} lost a semi-ricochet at (${row}, ${column})`
  );
}

function handleRicochetCollision(element, newRow, newColumn, location) {
  // console.log(element.style.transform);
  bulletDiv.classList = "bullet";
  const oldBulletDirection = bulletDirection;
  
  if (
    element.style.transform === "rotate(0deg)" ||
    element.style.transform === "rotate(180deg)"
  ) {
    switch (bulletDirection) {
      case "up":
        bulletDirection = "right";
        break;
      case "down":
        bulletDirection = "left";
        break;
      case "left":
        bulletDirection = "down";
        break;
      case "right":
        bulletDirection = "up";
        break;
    }
  } else if (
    element.style.transform === "rotate(90deg)" ||
    element.style.transform === "rotate(270deg)"
  ) {
    switch (bulletDirection) {
      case "up":
        bulletDirection = "left";
        break;
      case "down":
        bulletDirection = "right";
        break;
      case "left":
        bulletDirection = "up";
        break;
      case "right":
        bulletDirection = "down";
        break;
    }
  }
  shootBullet(newRow, newColumn, bulletDirection);
  rotateDirBullet(oldBulletDirection);
  // console.log(bulletDirection);
}
function rotateDirBullet(oldBulletDirection) {
  bulletDiv.classList = "bullet" //clear prev animaations
  // console.log(bulletDiv.style.transform);
  if(oldBulletDirection === "up"){
    if(bulletDirection === "left"){
    bulletDiv.classList.add("upLeftAnime")
    }else if(bulletDirection === "right"){
      bulletDiv.classList.add("upRightAnime")
    }
  }else if(oldBulletDirection === "down"){
    if(bulletDirection === "right"){
      bulletDiv.classList.add("downRightAnime")
      }else if(bulletDirection === "left"){
        bulletDiv.classList.add("downLeftAnime")
      }
  }else if(oldBulletDirection === "left"){
    if(bulletDirection==="up"){
      bulletDiv.classList.add("leftUpAnime")
    }else if(bulletDirection === "down"){
      bulletDiv.classList.add("leftDownAnime")
    }
  }else if(oldBulletDirection === "right"){
    if(bulletDirection==="up"){
      bulletDiv.classList.add("rightUpAnime")

    }else if(bulletDirection === "down"){
      bulletDiv.classList.add("rightDownAnime")
    }
  }


  switch (bulletDirection) {
    case "left":
      setTimeout(()=>{
        bulletDiv.style.transform = "rotate(270deg)";
      },bulletSpeed)
      // bulletDiv.style.transform = "rotate(270deg)"
      break;
    case "right":
      setTimeout(()=>{
        bulletDiv.style.transform = "rotate(90deg)";
      },bulletSpeed)
      // bulletDiv.style.transform = "rotate(90deg)"
      break;
    case "up":
      setTimeout(()=>{
        bulletDiv.style.transform = "rotate(0deg)";
      },bulletSpeed)
      // bulletDiv.style.transform = "rotate(0deg)";
      break;
    case "down":
      setTimeout(()=>{
        bulletDiv.style.transform = "rotate(180deg)";
      },bulletSpeed)
      // bulletDiv.style.transform = "rotate(180deg)";
      break;
  }
}
