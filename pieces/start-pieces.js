
let startPieces = ["", "", "",topCannon, "", topTitan, "",  "",
topTank ,topSemiRicochet,"" ,topRicochet, "", "", "",  "",
"", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "",
"", "", "", "", "",  "", "","",
"","", "",bottomRicochet, "", "", "",bottomSemiRicochet,
bottomTank, "", "", "",bottomCannon,  "", "", bottomTitan
];


let initialPieces = ["", "", "",topCannon, "", topTitan, "",  "",
topTank ,topSemiRicochet,"" ,topRicochet, "", "", "",  "",
"", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "",
"", "", "", "", "", "", "", "",
"", "", "", "", "",  "", "","",
"","", "",bottomRicochet, "", "", "",bottomSemiRicochet,
bottomTank, "", "", "",bottomCannon,  "", "", bottomTitan
];

const bluePieces = [
    topRicochet,
    topRicochet,
    topSemiRicochet,
    topTitan,
    topTank,
  ];
const greenPieces = [
    bottomRicochet,
    bottomRicochet,
    bottomSemiRicochet,
    bottomTank,
    bottomTitan
];  
const blueCannons = [topCannon]
const greenCannons = [bottomCannon]

function randomOpening() {
  const startPieces = Array(64).fill("");

  // Function to find a random empty position within a specified range
  function findEmptyPosition(start, end) {
    let position;
    do {
      position = Math.floor(Math.random() * (end - start + 1)) + start;
    } while (startPieces[position] !== "");
    return position;
  }

  // Place top and bottom cannons
  startPieces[findEmptyPosition(0, 7)] = topCannon;
  startPieces[findEmptyPosition(56, 63)] = bottomCannon;

  // Place blue pieces in the top two rows (0-15)
  bluePieces.forEach(piece => {
    startPieces[findEmptyPosition(0, 15)] = piece;
  });

  // Place green pieces in the bottom two rows (48-63)
  greenPieces.forEach(piece => {
    startPieces[findEmptyPosition(48, 63)] = piece;
  });

  return startPieces;
}
