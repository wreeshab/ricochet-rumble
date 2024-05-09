const gameBoard = document.getElementById("gameboard");
const width = 8;
const allSquares = gameBoard.querySelectorAll(".square");
const playerDisplay = document.querySelector("#turnspan");
const leftBtn = document.querySelector("#left");
const rightBtn = document.querySelector("#right");


let highlightedSquares = [];
let selectedPiece = null;
let currentPlayer = "green";
let ricochetRotation = {};
let gameStarted = true;
let gamePaused = false;


function restart() {
  document.location.reload();
}


function setRicoRotation() {
  for (i = 0; i < width * width; i++) {
    ricochetRotation[i] = 0;
  }
}
setRicoRotation();

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
  if (gameStarted) {
    if (!gamePaused) {
      const parentNode = e.target.parentNode;
      if (parentNode) {
        const boxId = parentNode.getAttribute("square-id");
        if (boxId) {
          const row = parseInt(boxId[0]);
          const column = parseInt(boxId[1]);
          const piece = startPieces[row * width + column];
          if (piece !== "") {
            selectedPiece = { row, column }; // Set selectedPiece
            if (piece === topCannon || piece === bottomCannon) {
              console.log("object");
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
const rotateLeftHandler = () => handleRotationClick(90);
const rotateRightHandler = () => handleRotationClick(-90);

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
}

function isValidPosition(row, column) {
  return row >= 0 && row < width && column >= 0 && column < width;
}

function movePiece(oldRow, oldColumn, newRow, newColumn) {
  startPieces[newRow * width + newColumn] =
    startPieces[oldRow * width + oldColumn];
  startPieces[oldRow * width + oldColumn] = "";
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

  // Update board
  updateBoard();
}

function changePlayer() {
  if (currentPlayer === "green") {
    currentPlayer = "blue";
    playerDisplay.innerText = "blue's";
  } else {
    currentPlayer = "green";
    playerDisplay.innerText = "green's";
  }
}

function updateBoard() {
  gameBoard.innerHTML = "";
  createBoard();
  // updateRicochetRotation(); // Uncomment this line to update the rotation of ricochet pieces
}
