import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import './TicTacToe.css'; // Assume some basic CSS for styling

function TicTacToe1() {
    console.log("TicTacToe1 component is mounted!");
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    // Resetting totalActions to manage within component state for a reset functionality
    const [totalActions, setTotalActions] = useState(0);

    function handleClick(i) {
        if (calcRes(board) || board[i]) {
            return; // If game is won or cell is occupied, ignore click
        }
        const boardCopy = [...board];
        boardCopy[i] = xIsNext ? 'X' : 'O';
        setBoard(boardCopy);
        setXIsNext(!xIsNext);
        setTotalActions(totalActions + 1); // Increment actions
        console.log(totalActions + 1);
    }

    function resetGame() {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setTotalActions(0); // Reset total actions
        console.log("Game has been reset!");
    }

    function renderSquare(i) {
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
                onClick={() => handleClick(i)}>
                {board[i]}
            </Button>
        );
    }

    function calcRes(squares) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6], // diagonals
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return `Winner: ${squares[a]}`;
            }
        }
        if (9 === totalActions) {
            return `Out of moves!`
        } else {
            return null;
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Grid container spacing={0} style={{ maxWidth: 216, maxHeight: 216 }} justifyContent="center" alignItems="center">
                <Grid item xs={12}>
                    <div className="gameStat">
                        {calcRes(board) ? ` ${calcRes(board)}` : `Next player: ${xIsNext ? 'X' : 'O'}`}
                        <p />
                    </div>
                </Grid>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Grid key={i} item xs={4} style={{ display: 'flex', justifyContent: 'center' }}>
                        {renderSquare(i)}
                    </Grid>
                ))}
            </Grid>
            {/* New Reset Button */}
            <Button variant="contained" color="secondary" onClick={resetGame} sx={{ mt: 5, fontWeight: 'bold' }}>
                Reset Training Game
            </Button>
        </div>
    );
}

export default TicTacToe1;