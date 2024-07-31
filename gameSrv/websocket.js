// websockets.js
const WebSocket = require('ws');
const socketIo = require('socket.io');
const User = require('./models/user.model'); 

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});

const initWebSocketServer = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "https://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true       
    },
    pingInterval: 10000, // How often a ping is sent to the client to check the connection, in milliseconds.
    pingTimeout: 5000, // How long to wait after the last ping is sent before considering the connection closed.
    maxHttpBufferSize: 1e6, // The maximum allowed message size in bytes.
    allowRequest: (req, callback) => {
      const noOriginHeader = req.headers.origin === undefined;
      callback(null, !noOriginHeader); // Allow requests without an origin header (like mobile apps or curl requests)
    },
    transports: ['polling', 'websocket'], // Transports to allow connections with.
    upgradeTimeout: 10000, // How long to wait for an upgrade of the transport, like from polling to WebSocket.
    cookie: false // Whether to send a cookie in the handshake response headers. This can be set to false to adhere to stateless HTTP guidelines.
});

  let gameCounter = 0 ;

  let userTrackSocketState = new Map(); // Tracks users and their socket IDs
  let userBindNicknameToSocket = new Map(); // Tracks users and their socket IDs
  let trackGamesAndUsers = new Map();

//########################################################################
  // Function to START a new game
  
  async function startNewMGame(user1, user2) {
    let user1First = false;

    try {
      const u1details = await User.findOne({ nickname: user1 });
      const u2details = await User.findOne({ nickname: user2 });

      if (u1details && u2details) {
        if (u1details.wins < u2details.wins) {
            user1First = true;
        } else if (u1details.wins > u2details.wins) {
            user1First = false;
        } else {
            // Randomly assign first player if wins are equal
            user1First = Math.random() < 0.5;
        }

        gameCounter++; // Increment the game counter
        console.log(`Starting new game # ${gameCounter}, user1First: ${user1First}`);
        
        let u1SocketId = getSocketIdFromNickname(user1);
        let u2SocketId = getSocketIdFromNickname(user2);

        if (!u1SocketId || !u2SocketId) {
          throw new Error("Socket IDs not found for one or both users");
        }

        trackGamesAndUsers.set(gameCounter, {
          userNick1: user1,
          user1sock: u1SocketId,
          userNick2: user2,
          user2sock: u2SocketId
        })

        return { gameID: gameCounter, user1FirstFlag: user1First };
      } else {
        console.log('One or both users not found in database');
        return null;  // Handle user not found scenario
      }
    } catch (err) {
      console.log('Error starting new multiplayer game:', err);
      return null;
    }
  }

  // Function to END a new game
  function endNewMGame(gameCounterID) {    
    if (trackGamesAndUsers.has(gameCounterID)) {
      trackGamesAndUsers.delete(gameCounterID);
    } else {
      // TODO FATAL ERROR!
      console.log(`Calling extra endNewMGame(gameCounter) for already closed game with gameID: ${gameCounterID}`);
    }
  }

//########################################################################

  function getUserDetailsNickSock(nickname) {
    const userSocketID = userBindNicknameToSocket.get(nickname);
    console.log(`Get User Details for nickname: ${nickname}, socketID: ${userSocketID}`);
    const userData = getUserDetails(userSocketID);
    
    if (undefined !== userData) {      
        console.log(`userData = getUserDetails(userSocketID): ${JSON.stringify(userData)}`);
        return userData;
    } else {
      console.log('FATAL ERROR - Not found the user with socketID: ', userSocketID);
        return null;
    }
  }

  function getSocketIdFromNickname(nickname) {
    const socketId = userBindNicknameToSocket.get(nickname);
    if (socketId) {
        console.log(`Socket ID for ${nickname} is ${socketId}`);
        return socketId;
    } else {
        console.error(`No socket ID found for nickname: ${nickname}`);
        return null;
    }
  }

  function removeUserNickSock(nickname) {
    const userData = userBindNicknameToSocket.get(nickname);
    if (undefined !== userData) {
      console.log(`removeUserNickSock Removing user with nickname: ${userData.nickname}`);
      userBindNicknameToSocket.delete(nickname);
    } else {
        console.error('removeUserNickSock User not found for removal!');
    }
  }
//########################################################################
  // Assuming socketID is known at the time of user login/connection
  function addUser(socketID, userNickname) {
      userTrackSocketState.set(socketID, {
      nickname: userNickname,
      statusFreeForMGame: true, // Default to true when user is added
      gameID: 0 // Default is no game ID
    });
    userBindNicknameToSocket.set(userNickname, socketID);
    console.log(`Setting with userBindNicknameToSocket.set(${userNickname}, ${socketID})`);
  }

  function updateStatusFreeForMGame(socketID, status) {
    const userData = userTrackSocketState.get(socketID);
    if (undefined !== userData) {
        userData.statusFreeForMGame = status;
    } else {
        console.log('updatestatusFreeForMGame: User not found!');
    }
  }

  function getUserDetails(socketID) {
    const userData = userTrackSocketState.get(socketID);
    if (undefined !== userData) {
        return userData;
    } else {
        return null;
    }
  }

  function removeUser(socketID) {
    const userData = userTrackSocketState.get(socketID);
    if (undefined !== userData) {
      console.log(`removeUser Removing user with nickname: ${userData.nickname}`);
      userTrackSocketState.delete(socketID);
    } else {
        console.error('removeUser User not found for removal!');
    }
  }

  io.on('connection', (socket) => {
    console.log('A user connected with id: ', socket.id);

    socket.on('reportUser', async (data) => {
      const currUser = await User.findOne({ nickname: data.nickname, loggedIn: true });
    
      if (currUser) {
        console.log(`User ${data.nickname} reporting his nickname for socket.id: ${socket.id}`);
        addUser(socket.id, data.nickname); // Associate socket ID with user nickname
      } else {          
        console.error('reportUser tries to report a non-existing or logged-out user!');
        socket.emit('reportUserNotFound', { message: 'No such logged-in user found.' });
      }
    });

    // Handle fetching logged-in users
    socket.on('getLoggedInUsers', async () => {
      try {
          const loggedInUsers = await User.find({ loggedIn: true })
              .sort({ totalWins: -1 })
              .select('nickname totalWins -_id')
              .exec();
          io.emit('loggedInUsers', loggedInUsers); // Emit the result to the requesting client
          console.log('Broadcast the LoggedIn list');
      } catch (err) {
          console.error('Error fetching logged in users:', err);
          socket.emit('error', { message: 'Failed to fetch logged in users.' });
      }
    });

    socket.on('user1invites2', ({ sender: user1, receiver: user2 }) => {
      
      let u1SocketId = getSocketIdFromNickname(user1);
      let u2SocketId = getSocketIdFromNickname(user2);
      
      console.log(` GAME INVITATION BY: ${user1} socketID: ${u1SocketId} TO : ${user2} socketID: ${u2SocketId}`);

      if (!u1SocketId || !u2SocketId) {
        console.log('One of the users not found upon invitation', { user1: !!u1SocketId, user2: !!u2SocketId });
        socket.to(u1SocketId).emit('serverErrorUponInvitation');
        return; // Exit if any user details are not found
      }

      let u1 = getUserDetails(u1SocketId);
      let u2 = getUserDetails(u2SocketId);

      if (u1 && u2 && u1.statusFreeForMGame && u2.statusFreeForMGame) {
          updateStatusFreeForMGame(u1SocketId, false);
          updateStatusFreeForMGame(u2SocketId, false);
          console.log(`${user1} invites ${user2} to play a game.`);
          socket.to(u2SocketId).emit('invitationByUser1', { sender: user1, receiver: user2 });
          // io.emit('invitationByUser1', { sender: user1, receiver: user2 });
      } else {
          if (!u2.statusFreeForMGame) {
            console.log("Server emitting invitationByUser1User2NotFree");
            socket.to(u1SocketId).emit('invitationByUser1User2NotFree');
          } else {
            console.log("Server emitting serverErrorUponInvitation");
            socket.to(u1SocketId).emit('serverErrorUponInvitation');
          }
      }  
    });

    socket.on('user1cancelInviteTo2', ({ sender: user1, receiver: user2 }) => {
      let u1SocketId = getSocketIdFromNickname(user1);
      let u2SocketId = getSocketIdFromNickname(user2);
      updateStatusFreeForMGame(u1SocketId, true);
      updateStatusFreeForMGame(u2SocketId, true);
      console.log(`${user1} cancels the game invite to ${user2}.`);
      socket.to(u2SocketId).emit('invitationByUser1Cancel', { sender: user1, receiver: user2 });
    });

    socket.on('user2acceptGame', async ({ sender: user2, receiver: user1 }) => {
      try {
        let u1SocketId = getSocketIdFromNickname(user1);
        let u2SocketId = getSocketIdFromNickname(user2);
    
        if (!u1SocketId || !u2SocketId) {
          throw new Error("Socket IDs not found for one or both users");
        }

        // Create GameID and session here
        // return { gameID: gameCounter, user1FirstFlag: user1First };
        let { gameID, user1FirstFlag } = await startNewMGame(user1, user2);
                
        socket.to(u1SocketId).emit('user2AcceptedInvitation', { sender: user2, receiver: user1, game: gameID, user1First: user1FirstFlag, partnerSocket: u2SocketId });
        
        io.to(u2SocketId).emit('gameStartID', { game: gameID, inviterNick: user1, user1First: user1FirstFlag, partnerSocket: u1SocketId });
        
        console.log(`${user2} accepts the game invite from ${user1}. GAME ID: ${gameID}, user1firstFlag: ${user1FirstFlag}`);
      } catch (error) {
        console.error("Error processing game acceptance:", error);
        // Handle error, maybe notify users
      }
    });

    socket.on('nextMoveToSrv', ({ gameID, player, index, socketToSend }) => {
      socket.to(socketToSend).emit('nextMove', {gameID, player, index});      
      console.log(`RELAY: nextMoveToSrv gameID: ${gameID}, player: ${player}, index: ${index}, socketToSend: ${socketToSend}`);
    });

    socket.on('gameEnd', async ({ gameID, result, socketToSend }) => {      
      if (result.draw){
        console.log(`Game Over: gameID ${result.gameID}, RESULT DRAW!`); 
      } else {
        console.log(`Game Over: gameID ${result.gameID}, Winner: ${result.winner} with : ${result.winningMark}`); 
      }      
      
      if (userTrackSocketState.has(socketToSend)){
        socket.to(socketToSend).emit('gameEndAtPartnerSide', { result });
        // increment in DB - total games, lost, won, draw, update stats      
        try {
          const { gameID, winner, winningMark, draw } = result;
          const gameDetails = trackGamesAndUsers.get(gameID);
          if (!gameDetails) {
            console.error(`No game details found for gameID: ${gameID}`);
            return;
          }
    
          if (draw){
            // Update both users' stats for a draw
            await User.updateOne(
              { nickname: gameDetails.userNick1 },
              { 
                $inc: { totalGamesPlayed: 1, totalDraws: 1 },
                $set: { lastAction: new Date() }
            });
            await User.updateOne(
              { nickname: gameDetails.userNick2 },
              { 
                $inc: { totalGamesPlayed: 1, totalDraws: 1 },
                $set: { lastAction: new Date() }
            });
      
            console.log(`Game results updated in DB: gameID ${gameID}, RESULT DRAW`);
          } else {
            // Determine the loser
            const loser = (winner === gameDetails.userNick1) ? gameDetails.userNick2 : gameDetails.userNick1;
      
            // Update winner's stats
            await User.updateOne(
              { nickname: winner },
              { 
                $inc: { totalGamesPlayed: 1, totalWins: 1, wins: 1 },
                $set: { lastAction: new Date() }
            });
      
            // Update loser's stats
            await User.updateOne(
              { nickname: loser },
              { 
                $inc: { totalGamesPlayed: 1, totalLoss: 1 },
                $set: { lastAction: new Date() }
            });      
            console.log(`Game results updated in DB: Winner - ${winner}, Loser - ${loser}`);
          }          
        } catch (err) {
          console.error('Error updating game results in database:', err);
        }    
      } else {
        console.log(`ERROR upon gameEnd, the other socket doesn't exist!`);
      }
    
      endNewMGame(gameID);
      updateStatusFreeForMGame(socket.id, true);
      updateStatusFreeForMGame(socketToSend, true);
    });

    socket.on('multiplayerGameCancel', ({ gameID, socketToSend }) => {
      socket.to(socketToSend).emit('gameCanceled');
      endNewMGame(gameID);
      updateStatusFreeForMGame(socket.id, true);
      updateStatusFreeForMGame(socketToSend, true);
    });


    socket.on('user2cancelGame', ({ sender: user2, receiver: user1 }) => {
      let u1SocketId = getSocketIdFromNickname(user1);
      let u2SocketId = getSocketIdFromNickname(user2);
      updateStatusFreeForMGame(u1SocketId, true);
      updateStatusFreeForMGame(u2SocketId, true);
      console.log(`${user2} rejects the game invite from ${user1}.`);
      socket.to(u1SocketId).emit('user2CancelledInvitation', { sender: user2, receiver: user1 });
    });

    socket.on('disconnect', (reason) => {
      let userToDisconnect = getUserDetails(socket.id);
      if (userToDisconnect){
        removeUserNickSock(userToDisconnect.nickname);
      }
      removeUser(socket.id);
      console.log(`User disconnected`, reason);
    });

    // More event listeners:
  });

  return io;
};

module.exports = initWebSocketServer;