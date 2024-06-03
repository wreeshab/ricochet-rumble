# Ricochet Rumble

Arjun, a tech enthusiast, was bored of playing chess. So he asked his nerd friend Vishrudh to suggest a two-player game that was new and more interesting. Vishrudh, who was lazy yet brilliant, came up with an immediate idea of Ricochet Rumble, where the game is played as follows:

## Game Logic

An 8x8 - 2 player turn-based board game consisting of 5 different pieces:
- Titan
- Tank
- Ricochets
- Semi Ricochets
- Cannon

### Piece Abilities
- Any piece can move one tile or rotate once.
- The cannon is allowed to move only in the horizontal direction and is positioned in the base rank.
- The aim of the game is to destroy the opponent’s Titan by striking the bullet through a series of various Ricochets.

## Modes

### Normal Mode
- ~Create an 8x8 grid for the game board.~
- ~Make the base config as shown in the video.~
- ~Make the cannon shoot a circular bullet.~
- ~Implement movement logic and move validation for each piece: they can move to adjacent or diagonally adjacent cells or rotate.~
- ~Add a time system: Each player gets a specific amount of time. The timer must decrement during the respective player’s turn. If the timer balls down to 0, the other player wins.~
- ~Make the game mobile responsive.~
- ~Add pause, resume, and reset feature.~

### Hacker Mode
- ~Implement the feature to undo and redo moves.~
- ~Make the bullet destroy semi Ricochets when hit in the non-reflecting surface.~
- ~Display the history of moves of each player. Store the history once the game ends in local storage.~
- ~Add game sound effects.~
- ~Make the cannon shoot a Directional bullet (you can use an asset).~
- ~Make the Ricochets swap with any piece (opponent's piece, too) except the Titans.~
- ~Make the tanks allow the bullets to pass through from any one side.~

### Hacker Mode++
- ~Using the stored game history, implement a game replay feature.~
- ~Randomized Playable starting position.~
- ~Animate the game movements (For e.g., smoother bullets).~
- ~Create a single-player mode where the opponent is a bot.~
- Add spells (For e.g., a spell which makes a piece passthrough for a move).

#### List of Bugs Found in Bot So Far
1) <s>say the bot is rotating one of its ricos/semiricos it'll rotate, no issues.... but but but if the same piece is moved by the bot in the next move, it'll rotate again to its initial position. The Dom structure is such that if a rico is rotated it parent node (ie .square) is rotated and not the svg element or the rico div. Upon moving the rico, that new parent will have style.transform = rotate(0deg) and old parent will have style.transform = rotate(90deg).
Note: other pieces going to the old parent will have 90 deg rotation whichh is absurdd.  </s> resolved
<br> resolved
2) <s> if a semiRico is broken it is not visually reflected immediately (its being updated in the next move only) though the master array is updated simulatneously. </s>
<br> resolved
3) <s> rico/semirico turning is not considered as a move => even after they rotate, one more move is getting executed => 2 bullets are being shot!!!!!</s> resolved <br>
4) <s>lets say the bot moves the cannon, then bullet is originating from the cannon's old location and not the new location.</s> resolved


##### List of bugs in replay
1) lets say a player moves the cannon, then bullet is originating from the cannon's old location and not the new location. :( major problem!!