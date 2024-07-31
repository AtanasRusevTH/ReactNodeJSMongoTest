import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import './TicTacToeMulti.css'; 

function TicTacToeMulti({ gameID, user1inviting, user2accepted, user1FirstBoolFl, currUserIsU1, socketFromParent, partnerSock, closeGame }) {
  
  console.log("TicTacToeMulti component is mounted!");
  let currentUserMark = (user1FirstBoolFl == currUserIsU1) ? 'X' : 'O';
  let otherUserMark = (user1FirstBoolFl == currUserIsU1) ? 'O' : 'X';

  const [board, setBoard] = useState(Array(9).fill(null));
  const [movesCntr, setMovesCntr] = useState(0);
  const [isCurrentUserTurn, setIsCurrentUserTurn] = useState(user1FirstBoolFl === currUserIsU1);
  const [gameStatus, setGameStatus] = useState(null);
  let currUserNick = currUserIsU1 ? user1inviting : user2accepted;
    
  useEffect(() => {
    // Listen to react to opponent action
    socketFromParent.on('nextMove', ({ gameID, player, index }) => {
      if ((currUserIsU1 && player !== user1inviting) || (!currUserIsU1 && player !== user2accepted)) {
        const newBoard = [...board];
        newBoard[index] = otherUserMark; // Opposite of current user's marker
        setBoard(newBoard);
        setMovesCntr(prevMovesCntr => prevMovesCntr + 1);
        setIsCurrentUserTurn(true); // Toggle turn to current user
      }
    });

    socketFromParent.on('gameEndAtPartnerSide', ({ result }) => {
      if (result.draw) {
        setGameStatus(`RESULT from game ${result.gameID}: DRAW`);
      } else {
        setGameStatus(`WINNER from game ${result.gameID}: is ${result.winner} with ${result.winningMark} !`);
      }      
      setIsCurrentUserTurn(false); // Disable moves after game end
      // TODO - add a info pop-up with two buttons - End Game Session and New Game
    });

    socketFromParent.on('gameCanceled', () => {
      // TODO - add a info pop-up with only one button - close
      console.log(`Game Canceled!`);
      closeGame();
    });

    return () => {
        socketFromParent.off('nextMove');
        socketFromParent.off('gameEndAtPartnerSide');
        socketFromParent.off('gameCanceled');        
    };
  }, [board, socketFromParent, isCurrentUserTurn, gameStatus, movesCntr]); // TODO - check, only thi,s not like before: , currUserIsU1, socketFromParent, isCurrentUserTurn

  const handleClick = (i) => {
    if (gameStatus || board[i] || !isCurrentUserTurn) {
      return; // Ignore if game ended, cell occupied, or not the user's turn
    }
    const newBoard = [...board];
    newBoard[i] = currentUserMark;
    setBoard(newBoard);
    const newMovesCntr = movesCntr + 1;
    setMovesCntr(newMovesCntr);
    setIsCurrentUserTurn(false); // Toggle turn away from current user

    socketFromParent.emit('nextMoveToSrv', { gameID, player: currUserIsU1 ? user1inviting : user2accepted, index: i, socketToSend: partnerSock });

    // Check for game end
    const result = calcRes(newBoard, newMovesCntr);
    if (result) {
      /*return {
        gameID,
        winner: currUserNick,
        winningMark: squares[a],
        draw
      };*/
      if (result.draw) {
        setGameStatus(`RESULT from game ${result.gameID}: DRAW`);
      } else {
        setGameStatus(`WINNER from game ${result.gameID}: is ${result.winner} with ${result.winningMark} !`);
      }
      socketFromParent.emit('gameEnd', { gameID, result, socketToSend: partnerSock });
    }
  };

  const resetGame = () => {
    /*setBoard(Array(9).fill(null));
    setIsCurrentUserTurn(user1FirstBoolFl === currUserIsU1); // Reset turn based on initial settings
    setGameStatus(null);*/   
    // // TODO - add a info pop-up with two buttons - Finish Session and N 
    console.log("Just clicked a reset button, currently DUMMY!");
  };

  const cancelGame = () => {
    socketFromParent.emit('multiplayerGameCancel', { gameID, socketToSend: partnerSock });
    console.log("GAME CANCELED!!!");
    closeGame();
  };

  const renderSquare = (i) => {
    return (
      <Button
        variant="outlined"
        sx={{
          minWidth: 72,
          minHeight: 72,
          backgroundColor: 'white',
          border: 3,
          borderColor: 'magenta.500',
          borderRadius: 2,
          boxShadow: '1px 1px 5px cyan',
          fontSize: '2rem',
          fontWeight: 'bold',
          ':hover': {
            backgroundColor: 'grey.100',
          }
        }}
        onClick={() => handleClick(i)}
        disabled={!isCurrentUserTurn || gameStatus !== null}
      >
        {board[i]}
      </Button>
    );
  };

  const calcRes = (squares, movesCntr) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6], // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {        
        return {
          gameID,
          winner: currUserNick,
          winningMark: squares[a],
          draw: false
        };
      }
    }
    if (movesCntr >= 9){
      return {
        gameID,
        winner: '',
        winningMark: '',
        draw: true
      };
    }
    return null; // Updated to not end the game prematurely
  };

  return (
    <div className="multiGame-popup" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', zIndex: 1002 }}>
      <span className="close-button" onClick={cancelGame}>X</span>
      <Grid container spacing={0} style={{ maxWidth: 216, maxHeight: 216 }} justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <div className="gameStat">
            <p>Game ID: {gameID}</p>
            <p>First user is: {user1FirstBoolFl ? user1inviting : user2accepted} </p>
            <p>This user is: {currUserIsU1 ? user1inviting : user2accepted} playing with: {currentUserMark}</p>            
            {gameStatus ? ` ${gameStatus}` : `Next player: ${currUserNick}`}
          </div>
        </Grid>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Grid key={i} item xs={4} style={{ display: 'flex', justifyContent: 'center' }}>
            {renderSquare(i)}
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" color="secondary" onClick={resetGame} sx={{ mt: 20, fontWeight: 'bold' }}>
        Reset Game
      </Button>
    </div>
  );
}

export default TicTacToeMulti;