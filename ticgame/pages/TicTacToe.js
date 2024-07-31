import React, { useState } from 'react';
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import './TicTacToe.css'; // Assume some basic CSS for styling

let totalActions = 0;

function TicTacToe() {
    console.log("TicTacToe component is mounted!");
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const result = calcRes(board);

    function handleClick(i) {
        if (result || board[i]) {            
            return; // If game is won or cell is occupied, ignore click
        }
        const boardCopy = [...board];
        boardCopy[i] = xIsNext ? 'X' : 'O';
        setBoard(boardCopy);
        setXIsNext(!xIsNext);
        totalActions++;
        console.log(totalActions)
    }

    function renderSquare(i) {
        return (
            <Button
            variant="outlined"
            sx={{
                minWidth: 72, // button min Width
                minHeight: 72, 
                backgroundColor: 'white', 
                border: 3, // border thickness
                borderColor: 'magenta.500', 
                borderStyle: 'solid',
                borderRadius: 2,
                boxShadow: '1px 1px 5px cyan',
                fontSize: '2rem', // rem - relative to the general page size
                fontWeight: 'bold',
                accentColor: "",
                ':hover': {
                    backgroundColor: 'grey.100', 
                    //boxShadow: '1px 1px 20px cyan',
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

        <Grid container spacing={0} style={{ maxWidth: 216, maxHeight: 216}} justifyContent="center" alignItems="center">
            <Grid item xs={12}>
                <div className="gameStat" >
                    { result ? ` ${result}` : `Next player: ${xIsNext ? 'X' : 'O'}`}
                    <p/>
                    </div>
            </Grid>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Grid key={i} item xs={4} style={{ display: 'flex', justifyContent: 'center' }}>
                    {renderSquare(i)}
                </Grid>
            ))}
        </Grid>
        </div>
    );
}

export default TicTacToe;