// server.js
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');
const db = require('./db'); // MongoDB connection setup
const User = require('./models/user.model'); // Import the User model
const app = express();
const initWebSocketServer = require('./websocket');

// Middleware
app.use(express.json()); // Body parser

const corsOptions = {
  origin: 'https://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Routes
const authRoutes = require('./routes/auth.routes');
const statsRoutes = require('./routes/stats.routes');
const gameRoutes = require('./routes/game.routes');

app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/game', gameRoutes);

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path, req.body);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

// SSL/TLS Certificate options
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

// Define a simple route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
const server = https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});

// code to check user inactivity to log him out atuomatically after more than 3 hours of inactivity:
const checkForInactiveUsers = async () => {
  const threeHoursAgo = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
  const usersToLogout = await User.updateMany(
    { loggedIn: true, lastAction: { $lt: threeHoursAgo } },
    { $set: { loggedIn: false } }
  );
  console.log(`Logged out ${usersToLogout.nModified} users due to inactivity.`);
};

// Set this to run every hour
setInterval(checkForInactiveUsers, 60 * 60 * 1000);

// Initialize WebSocket server
initWebSocketServer(server);