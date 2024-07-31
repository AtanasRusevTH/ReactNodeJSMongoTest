const mongoose = require('mongoose');

mongoose.connect('mongodb://user:password@103.13.210.25:27017/tic2db', {
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

module.exports = db;