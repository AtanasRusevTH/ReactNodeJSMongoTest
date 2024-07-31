const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    sequenceNumber: { type: Number, required: true },
    playerOne: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    playerTwo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Add more game related fields as needed
});

module.exports = mongoose.model('GameDB', gameSchema);