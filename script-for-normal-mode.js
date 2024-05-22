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

const timer = document.querySelector("#timertext");

let highlightedSquares = [];
let selectedPiece = null;
let currentPlayer = "green";
let ricochetRotation = {};
let bulletDirection = "";
let cannonCoords;
let bulletSpeed = 100;
let remainingSeconds = 21
let timerId = null;

//bools
let gameOver = false;
let gamePaused = false;
let isBulletMoving = false;
rightBtn.disabled = true;
leftBtn.disabled = true;

let bulletDiv = document.createElement("div");
bulletDiv.classList.add("bullet");
bulletDiv.innerHTML = bullet;

playerDisplay.innerText = "green's";

function setRicoRotation() {
  for (i = 0; i < width * width; i++) {
    ricochetRotation[i] = 0;
  }
}
setRicoRotation();
function equatePieces() {
  for (i = 0; i < width * width; i++) {
    startPieces[i] = initialPieces[i];
    console.log(`${startPieces[i]} ${i}`);
  }
}
function updateTimer() {
  if (!gamePaused&&!gameOver) {
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
  }
}

function resumeGame() {
  gamePaused = false;
  pausePopup.style.visibility = "hidden";
  pauseButton.disabled = false;
  startTimer(); // Start the timer
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
  }
}
function gameWin(element, currentLocation) {
  currentLocation.removeChild(bulletDiv);

  console.log("game over");
  gameOver = true;
  isBulletMoving = false;
  pauseButton.disabled = true;
  if (element.firstElementChild.classList.contains("blue")) {
    document.getElementById("winner-text").textContent = "Green Won!";
  } else {
    document.getElementById("winner-text").textContent = "Blue Won!";
  }
  element.innerHTML = "";
  element.innerHTML = gameOverCoin;
  winnerNotice.style.visibility = "visible";
}
function playAgain() {
  winnerNotice.style.visibility = "hidden";
  resetGame();
}
function handlePlayerLossByTime(player) {
  gameOver = true;

  isBulletMoving = false;
  clearInterval(timerId); // Stop the timer
  pauseButton.disabled = true;

  if (player === "green") {
    document.getElementById("winner-text").textContent = "Time Over: Blue Won!";
  } else {
    document.getElementById("winner-text").textContent = "Time Over: Green Won!";
  }

  winnerNotice.style.visibility = "visible";
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
resetButton.addEventListener("click", resetGame);
pauseButton.addEventListener("click", pauseGame);
resumeButton.addEventListener("click", resumeGame);
playAgainBtn.addEventListener("click", playAgain);

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
          console.log(e.target);
          if (parentNode) {
            const boxId = parentNode.getAttribute("square-id");
            if (boxId) {
              const row = parseInt(boxId[0]);
              const column = parseInt(boxId[1]);
              const piece = startPieces[row * width + column];
              if (piece !== "") {
                selectedPiece = { row, column }; // Set selectedPiece
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
  const currentPosition = selectedPiece.row * width + selectedPiece.column;

  // Set the rotation angle to the provided degrees
  ricochetRotation[currentPosition] += degrees;
  ricochetRotation[currentPosition] %= 360;
  if (ricochetRotation[currentPosition] < 0) {
    ricochetRotation[currentPosition] += 360;
  }
  console.log(ricochetRotation[currentPosition]);
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

  handleCannonShoot(currentPlayer);
  updateBoard();
}

function isValidPosition(row, column) {
  return row >= 0 && row < width && column >= 0 && column < width;
}

function movePiece(oldRow, oldColumn, newRow, newColumn) {
  startPieces[newRow * width + newColumn] =
    startPieces[oldRow * width + oldColumn];
  startPieces[oldRow * width + oldColumn] = "";
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
  const oldIndex = oldRow * width + oldColumn;
  const newIndex = newRow * width + newColumn;

  startPieces[oldIndex] = "";

  if (oldRow === 0) {
    startPieces[newIndex] = topCannon;
  } else {
    startPieces[newIndex] = bottomCannon;
  }
  updateBoard();
  handleCannonShoot(currentPlayer);
  updateBoard();
}

function moveRicochet(oldRow, oldColumn, newRow, newColumn) {
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

  handleCannonShoot(currentPlayer);

  // Update board
  updateBoard();
}

function updateBoard() {
  gameBoard.innerHTML = "";
  createBoard();
  // updateRicochetRotation(); // Uncomment this line to update the rotation of ricochet pieces
}

console.log(currentPlayer);

function handleCannonShoot(currentPlayer) {
  console.log(currentPlayer);
  if (currentPlayer == "green") {
    cannonCoords = document
      .getElementById("bottomCanon")
      .parentNode.getAttribute("square-id");
    bulletDirection = "up";
    console.log(cannonCoords);
  } else {
    cannonCoords = document
      .getElementById("topCannon")
      .parentNode.getAttribute("square-id");
    bulletDirection = "down";
  }
  //--
  // bulletDirection = row === 0 ? "down" : "up";
  //--
  shootBullet(
    parseInt(cannonCoords[0]),
    parseInt(cannonCoords[1]),
    bulletDirection
  );
}

function shootBullet(row, column, bulletDirection) {
  let location = gameBoard.querySelector(`[square-id="${row}${column}"]`);

  location.appendChild(bulletDiv);

  moveBullet(location, row, column, bulletDirection);
}
function moveBullet(location, row, column, bulletDirection) {
  setTimeout(() => {
    console.log(bulletDirection);
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
        // location.removeChild(bulletDiv);
        // isBulletMoving = false;
        // changePlayer();
        return;
      } else {
        newBox.appendChild(bulletDiv);
        location = newBox;
        isBulletMoving = true;
        console.log(bulletDirection);
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
  console.log("collided with", element.children[0].id);

  if (
    element.children[0].id == "tank" ||
    element.children[0].id == "topCannon" ||
    element.children[0].id == "bottomCanon"
  ) {
    console.log("hit", element.children[0].id);
    currentLocation.removeChild(bulletDiv);
    isBulletMoving = false;
    changePlayer();
  } else if (element.children[0].id == "titan") {
    gameWin(element, currentLocation);
  } else if (element.children[0].id == "semiRicochet") {
    handleSemiRicochetCollision(element, newRow, newColumn, currentLocation);
  } else if (element.children[0].id == "ricochet") {
    handleRicochetCollision(element, newRow, newColumn, currentLocation);
  }
}
function removeBullet(location) {
  location.removeChild(bulletDiv);
  isBulletMoving = false;
  changePlayer();
}
function handleSemiRicochetCollision(element, newRow, newColumn, location) {
  console.log(element.style.transform);
  console.log(bulletDirection);

  if (element.style.transform === "rotate(0deg)") {
    console.log(location);
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
  } else {
    shootBullet(newRow, newColumn, bulletDirection);
  }
}

function handleRicochetCollision(element, newRow, newColumn, location) {
  console.log(element.style.transform);
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
  console.log(bulletDirection);
}
