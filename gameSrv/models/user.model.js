const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nickname: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalGamesPlayed: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalDraws: { type: Number, default: 0 },
    totalLoss: { type: Number, default: 0 },
    loggedIn: { type: Boolean, default: false },
    wins: { type: Number, default: 0 }, // For sorting in listOfAvailableLoggedInNonPlayingUsers
    lastAction: { type: Date, default: Date.now },
    freeForMultiplGame: { type: Boolean, default: false }
});

module.exports = mongoose.model('UserDB', userSchema);
