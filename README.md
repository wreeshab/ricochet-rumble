<h1>RICOCHET RUMBLE</h1>



<h2>Normal Mode</h2> <b>OVER</b>

1)<s>Create an 8x8 grid for the game board. Make the base config as shown in the video.</s>
<br>
2)<s>Make the cannon shoot a circular bullet. Implement movement logic and move validation for each piece: they can move to adjacent or diagonally adjacent cells or rotate.</s>
<br>
3)<s>Add a time system: Each player gets specific amount of time. The timer must decrement during the respective player’s turn. If the timer balls down to 0, the other player wins.</s>
<br>
4)<s>Make the game mobile responsive.</s>
<br>
5)<s>Add pause, resume and reset feature.</s>

<h2>Hacker Mode</h2> <b>OVER</b>


1)<s>Implement the feature to undo and redo the moves.</s> <br>
2)<s>Make the bullet destroy semi Ricochets when hit in the non reflecting surface.(a small bug exists)</s>
<br>
3)<s>Display the history of moves of each player. Store the history once the game ends in local storage.</s>
<br>
4)<s>Add game sound effects.</s>
<br>q
5)<s>Make the cannon shoot a Directional bullet (you can use an asset)</s>
<br>
6)<s>Make the Ricochets swap with any piece (opponent's piece, too) except the Titans.
</s> <em>this feature is not implemented in hacker plus plus mode</em><br>
7)<s>Make the tanks to allow the bullets to pass through from any one side.</s>
<br>

<h2>Hacker++ Mode</h2> 

1)<s>Using the stored game history, implement a game replay feature.</s>
<br>
2)<s>Randomized Playable starting position.</s>
<br>
3)Animate the game movements (For e.g., smoother bullets)
<br>
5)Add spells (For eg: spell which makes a piece passthrough for a move)
<br>
4)<s>Create a single-player mode where the opponent is a bot.</s>
<br>

## List of Bugs Found in Bot So Far
1) <s>say the bot is rotating one of its ricos/semiricos it'll rotate, no issues.... but but but if the same piece is moved by the bot in the next move, it'll rotate again to its initial position. The Dom structure is such that if a rico is rotated it parent node (ie .square) is rotated and not the svg element or the rico div. Upon moving the rico, that new parent will have style.transform = rotate(0deg) and old parent will have style.transform = rotate(90deg).
Note: other pieces going to the old parent will have 90 deg rotation whichh is absurdd.  </s> resolved
<br>
2) if a semiRico is broken it is not visually reflected immediately (its being updated in the next move only) though the master array is updated simulatneously.
<br>
3)<s> rico/semirico turning is not considered as a move => even after they rotate, one more move is getting executed => 2 bullets are being shot!!!!!</s> resolved <br>
4) lets say the bot moves the cannon, then bullet is originating from the cannon's old location and not the new location.


## List of bugs in replay
1) lets say a player moves the cannon, then bullet is originating from the cannon's old location and not the new location.