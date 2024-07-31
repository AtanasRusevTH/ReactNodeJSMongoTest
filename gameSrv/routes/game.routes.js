const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Game = require('../models/game.model');

router.get('/loggedInUsers', async (req, res) => {
    try {
        const loggedInUsers = await User.find({ loggedIn: true })
            .sort({ totalWins: -1 })
            .select('nickname totalWins')
            .exec();
        User.updateOne({ nickname: nickname }, { $set: { lastAction: new Date() } });
        res.json(loggedInUsers);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start a new game
// Method extends "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" = any,
router.post('/startGame', async (req, res) => {
    const { playerOneNickname, playerTwoNickname } = req.body;
    try {
        const playerOne = await User.findOne({ nickname: playerOneNickname });
        const playerTwo = await User.findOne({ nickname: playerTwoNickname });

        if (!playerOne || !playerTwo) {
            res.status(404).json({ message: 'One or both players not found' });
            return;
        }

        // Update player statuses and create a new game entry
        playerOne.loggedIn = false;
        playerTwo.loggedIn = false;
        await Promise.all([playerOne.save(), playerTwo.save()]);        

        const newGame = new Game({
            playerOne: playerOne._id,
            playerTwo: playerTwo._id
            // Add other game related fields
        });
        const savedGame = await newGame.save();
        User.updateOne({ nickname: nickname }, { $set: { lastAction: new Date() } });
        res.status(201).json(savedGame);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;