const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Get user stats
// Method extends "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head" = any,
router.get('/userStats/:nickname', async (req, res) => {
    const { nickname } = req.params;
    console.log("DB Stats Request with: ", nickname)
    try {
        const user = await User.findOne({ nickname })
                               .select('totalGamesPlayed totalWins totalDraws totalLoss -_id');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        } else {
            User.updateOne({ nickname: nickname }, { $set: { lastAction: new Date() } });
            res.status(200).json(user);            
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get top players by wins and games played
router.get('/topPlayers', async (req, res) => {
    try {
        const topPlayersByWins = await User.find().sort({ totalWins: -1 }).limit(5);
        const topPlayersByGames = await User.find().sort({ totalGamesPlayed: -1 }).limit(5);
        
        // User.updateOne({ nickname: nickname }, { $set: { lastAction: new Date() } });

        res.status(200).json({
            topWins: topPlayersByWins,
            topGames: topPlayersByGames
        });        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get top players by wins
router.get('/topPlayersByWins', async (req, res) => {
    try {
        const topPlayers = await User.find().sort({ totalWins: -1 }).limit(5);
        // User.updateOne({ nickname: nickname }, { $set: { lastAction: new Date() } });
        res.status(200).json(topPlayers);        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get best players by number of games (assuming more games played means better)
router.get('/bestPlayersByTotalGames', async (req, res) => {
    try {
        const bestPlayers = await User.find().sort({ totalGamesPlayed: -1 }).limit(5);
        // User.updateOne({ nickname: nickname }, { $set: { lastAction: new Date() } });
        res.status(200).json(bestPlayers);        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
