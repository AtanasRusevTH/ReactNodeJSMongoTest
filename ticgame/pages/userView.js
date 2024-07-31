// userView.js
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import './userView.css'
import { StatsData, ChampsData } from './statsChamps';
import io from 'socket.io-client';
import TicTacToeMulti from './TicTacToeMulti';

function UserView({currUser, onLogOut, hideSimpleGame}) {
  console.log("Entering UserView with user: ", currUser);

  const [socket, setSocket] = useState(null);

  // State to control pop-up visibility  
  const [ShowChampsPopup, setShowChampsPopup] = useState(false);
  const [loggedInUsers, setLoggedInUsers] = useState([]);
  
  const [ShowListOfAvailableUsers, setShowListOfAvailableUsers] = useState(false);

  const [waitingInviteResponseFromUser, setWaitingInviteResponseFromUser] = useState(false);
  const [invitedUser, setInvitedUser] = useState('');

  const [pendingInviteAnswerToUser, setPendingInviteAnswerToUser] = useState(false);
  const [pendingInviteAnswerToUserNickname, setPendingInviteAnswerToUserNickname] = useState('');

  // Multiplayer game DATA:
  const [MultiPlayerGame, setMultiPlayerGame] = useState(false);
  const [MultCurrUserIsU1, setMultCurrUserIsU1] = useState(false);
  const [MultiPlayerGameID, setMultiPlayerGameID] = useState(null);
  const [MultiPlayerUser1nick, setMultiPlayerUser1nick] = useState(null);
  const [MultiPlayerUser2nick, setMultiPlayerUser2nick] = useState(null);
  const [MultiPlayerPartnerSocket, setMultiPlayerPartnerSocket] = useState(null);  
  const [MultiPlayerUser1first, setMultiPlayerUser1first] = useState(false);

  const setupSocketListeners = (newSocket) => {
    console.log("Setting up Socket listeners!");
    // events to be sent:
    // reportUser
    // getLoggedInUsers
    // user1invites2
    // user1cancelInviteTo2
    // user2acceptGame
    // user2cancelGame

    newSocket.on('loggedInUsers', handleLoggedInUsers);

    // General Error upon registering on WebSocket!
    newSocket.on('reportUserNotFound', handleReportUserNotFound);

    newSocket.on('invitationByUser1', handleInvitationByUser1);
    newSocket.on('invitationByUser1Cancel', handleInvitationByUser1Cancel);
    
    newSocket.on('serverErrorUponInvitation', handleServerErrorUponInvitation);
    newSocket.on('invitationByUser1User2NotFree', handleInvitationByUser1User2NotFree);

    newSocket.on('user2AcceptedInvitation', handleUser2AcceptedInvitation);
    newSocket.on('user2CancelledInvitation', handleUser2CancelledInvitation);
    newSocket.on('gameStartID', handleGameStartID);    

    newSocket.on('error', handleError);
  };

//################################################################

  // Handler for 'loggedInUsers' event
  const handleLoggedInUsers = (data) => {
    console.log('Received loggedIn users:', data);

    // Find and remove the current user from the list
    const currentUserIndex = data.findIndex(user => user.nickname === currUser);
    console.log('From the list of active users found the current at index: ', currentUserIndex);
    let currentUserEntry = null;
    if (currentUserIndex > -1) {
      currentUserEntry = data.splice(currentUserIndex, 1)[0]; // This removes and returns the current user
      console.log('Current User data extracted from the list of active users:', currentUserEntry);
    }

    // Sort the remaining users by totalWins in descending order
    setLoggedInUsers(data.sort((a, b) => b.totalWins - a.totalWins));
  };

//################################################################
  // SEND Game Invitation LOGIC
  
  // OUTGOING
  // SEND 'user1invites2'
  const sendInitiateGameInvitation = (toNickname) => {
    setInvitedUser(toNickname);
    // onUserSelect(nickname);
    console.log(`${currUser} wants to play with: `, toNickname);
    socket.emit('user1invites2', { sender: currUser, receiver: toNickname });
    setWaitingInviteResponseFromUser(true);
  };

  // SEND 'user1cancelInviteTo2'
  const cancelOutgoingGameInvite = (toNickname) => {
    console.log('Cancelling game invite to ', toNickname);
    socket.emit('user1cancelInviteTo2', { sender: currUser, receiver: toNickname });
    setWaitingInviteResponseFromUser(false);
  };

  // INCOMING

  // Handler for 'user2AcceptedInvitation' event
  const handleUser2AcceptedInvitation = ({ sender, receiver, game, user1First, partnerSocket}) => {
    console.log(`handleUser2AcceptedInvitation Game invite accepted by ${sender}, gameID: ${game} -> CALL GameSTART`);   

    setWaitingInviteResponseFromUser(false);    
    // *****************************************
    // TODO: TRANSITION TO GAME VIEW HERE !!!
    // *****************************************
    GameSTART(game, currUser, sender, user1First, true, partnerSocket);
  };

  // Handler for 'serverErrorUponInvitation'
  const handleServerErrorUponInvitation = () => {
    console.log(`Server Error upon invite to ${invitedUser}`);
    setWaitingInviteResponseFromUser(false);
    // TODO: Info Message Server Error
  };

  // Handler for 'invitationByUser1User2NotFree'
  const handleInvitationByUser1User2NotFree = ({ sender, receiver }) => {
    console.log(`User ${sender} not available for a game`);
    alert(`User ${sender} not available for a game`);
    setWaitingInviteResponseFromUser(false);
    // TODO: Info message
  };
  
  // Handler for 'user2CancelledInvitation' event
  const handleUser2CancelledInvitation = ({sender, receiver}) => {
    console.log(`A game invite was rejected by ${sender}`);
    alert(`User ${sender} Rejected the game invite`);
    setWaitingInviteResponseFromUser(false);
  };

  // SEND Game Invitation LOGIC END

//################################################################
  // RECEIVE Game Invitation LOGIC
  
  // INCOMING
  // handle 'invitationByUser1'
  const handleInvitationByUser1 = ({ sender, receiver }) => {
    console.log(`${receiver} Received game invite from ${sender}`);
    // TODO: Handle showing invite acceptance dialog
    setPendingInviteAnswerToUser(true);
    setPendingInviteAnswerToUserNickname(sender);
  };

  // Handler for 'invitationByUser1Cancel' event
  const handleInvitationByUser1Cancel = ({ sender }) => {
    console.log(`Game invite cancelled by ${sender}`);
    setPendingInviteAnswerToUser(false);
    // TODO: Close dialog showing waiting for response
  };

  // *****************************************
    // TODO: TRANSITION TO GAME VIEW HERE !!!
    // *****************************************
  // Handler for 'gameStartID' event
  const handleGameStartID = ({ game, inviterNick, user1First, partnerSocket}) => {
    console.log(`handleGameStartID inviter ${inviterNick} -> CALL GameSTART`);       
    GameSTART(game, inviterNick, currUser, user1First, false, partnerSocket);
  };

  // OUTGOING
  // SEND 'user2acceptGame'
  const sendResponseAccept = () => {
    setPendingInviteAnswerToUser(false);
    console.log(`game invite FROM ${pendingInviteAnswerToUserNickname} accepted`);
    socket.emit('user2acceptGame', { sender: currUser, receiver: pendingInviteAnswerToUserNickname });    
    // *****************************************
    // Waiting gameStartID to TRANSITION TO GAME VIEW 
    // *****************************************
  };  

  // SEND 'user2cancelGame'
  const sendResponseReject = () => {
    setPendingInviteAnswerToUser(false);
    console.log(`game invite FROM ${pendingInviteAnswerToUserNickname} rejected`);
    socket.emit('user2cancelGame', { sender: currUser, receiver: pendingInviteAnswerToUserNickname });
  };

  // RECEIVE Game Invitation LOGIC END
//################################################################
  // GAME START FUNCTION

  const GameSTART = (gameIDfromSrv, user1nick, user2nick, user1First, currUserisU1, partnSock) => {

    console.log(`GameSTART ID: ${gameIDfromSrv}, user1nick: ${user1nick}, user2nick: ${user2nick}, user1First: ${user1First}`); 
    if (true === currUserisU1) {
      setMultCurrUserIsU1(true);
    } else if (false === currUserisU1){
      setMultCurrUserIsU1(false);
    } else {
      console.log(`Critical error in game logic! currUserisU1: ${currUserisU1}`);
      alert(`Critical error in game logic! currUserisU1: ${currUserisU1}`);
      return;
    }

    console.log(`MultCurrUserIsU1: ${MultCurrUserIsU1}`);

    setMultiPlayerPartnerSocket(partnSock);
    setMultiPlayerGameID(gameIDfromSrv);
    setMultiPlayerUser1nick(user1nick);
    setMultiPlayerUser2nick(user2nick);
    setMultiPlayerUser1first(user1First);    
    setShowListOfAvailableUsers(false);
    setMultiPlayerGame(true);
  }

  const closeGameClickHandler = () => {
    // TODO - finish logic
    console.log(`UserView closeGameClickHandler called! setMultiPlayerGame(false);!`);
    setMultiPlayerGameID(null);
    setMultiPlayerUser1nick(null);
    setMultiPlayerUser2nick(null);
    setMultiPlayerUser1first(null);
    setMultiPlayerGame(false);
  }
//################################################################
  // Additional handlers:

  const handlePlayNow = () => {
    console.log("Clicked the Play Now button");
    socket.emit('getLoggedInUsers');
    setShowListOfAvailableUsers(true);
  };

  const handleReportUserNotFound = (data) => {
    console.error('Error on the Server: Your user is not logged in! Contact Admin!', data.message);
    alert(`Error on the Server: Your user is not logged in! Contact Admin!: ${data.message}`);
  };
  // Handler for any errors received
  const handleError = (error) => {
    console.error('Error received from WebSocket Server:', error.message);
    alert(`WebSocket Error: ${error.message}`);
  };

  const handleCloseChampsPopup = () => {
    setShowChampsPopup(false);
  };
  
//################################################################  

  useEffect(() => {

    if (null === socket) {
      // Initialize WebSocket connection only once
      const newSocket = io('https://localhost:5000', { 
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        secure: true,
        timeout: 20000,
        rejectUnauthorized: false });

      // Connect to the socket
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server for multiplayer game.');
        newSocket.emit('reportUser', { nickname: currUser }); // Emitting user nickname right after connection
        setupSocketListeners(newSocket);
      });
      newSocket.on('disconnect', () => { newSocket.connect();
      })
      setSocket(newSocket);
    }      

    // Add event listener for keyboard events
    const handleKeyDown = (event) => {      
      if (event.key === 'Escape') {
        if(waitingInviteResponseFromUser) {
          cancelOutgoingGameInvite(invitedUser);
        } else if(pendingInviteAnswerToUser) {
          sendResponseReject();
        } else if (ShowListOfAvailableUsers) {
          setShowListOfAvailableUsers(false);
        }
      }
    };

    // handle to request logout of the user if the browser is closed
    // though not completely guaranteeing success, this can be helpful 
    // to reduce the workload on the server side for users 
    // who obviously want to leave the game portal for now
    const handleBeforeUnload = async () => {
      await fetch('https://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname: currUser })
      });
    };  
      
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on component unmount
    return () => {      
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (socket) {
        // Unsubscribe from all socket events on cleanup to prevent memory leaks
        removeSocketListeners();
        socket.close();
        console.log("Socket disconnected");
      }      
    };
  }, [currUser, socket]);

  // Use useEffect to react to changes in MultCurrUserIsU1
  useEffect(() => {
    console.log(`MultCurrUserIsU1 updated to: ${MultCurrUserIsU1}`);
    // Perform actions that depend on the updated state here
  }, [MultCurrUserIsU1]); // This useEffect runs whenever MultCurrUserIsU1 changes

  // Use useEffect to react to changes in MultCurrUserIsU1
  useEffect(() => {
    console.log(`ShowListOfAvailableUsers updated to: ${ShowListOfAvailableUsers}`);
    
  }, [ShowListOfAvailableUsers]); 
  

  
  const removeSocketListeners = () => {
    socket.off('loggedInUsers', handleLoggedInUsers);
    socket.off('reportUserNotFound', handleReportUserNotFound);
    socket.off('invitationByUser1', handleInvitationByUser1);
    socket.off('invitationByUser1Cancel', handleInvitationByUser1Cancel);
    socket.off('serverErrorUponInvitation', handleServerErrorUponInvitation);
    socket.off('invitationByUser1User2NotFree', handleInvitationByUser1User2NotFree);
    socket.off('user2AcceptedInvitation', handleUser2AcceptedInvitation);
    socket.off('user2CancelledInvitation', handleUser2CancelledInvitation);
    socket.off('error', handleError);
  };

  const logOut = async () => {
    console.log('Logging Out');
    // Prepare user data for registration    
        
    console.log('Attempt User LogOut:', currUser);

    try {
      const response = await fetch('https://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({nickname: currUser})
      });
      const responseMsg = await response.json(); // Parse JSON body of the response

      if (response.ok) {
          console.log('DB Status Logout SUCCESS: ', responseMsg);
          onLogOut();
          if (socket) {
            socket.close();
          }
      } else {        
        console.error('Logout failed:', responseMsg.message);
        alert(`ERROR! ${responseMsg.message}`);
      }
    } catch (error) {
        console.error('Logout attempt request failed:', error);
        alert('Failed to Log Out. Please try again later.');
        return;
    }
  };

  //################################################################
    // The PopUp for the game initiator - SEND INVITE 
    function InviteAuserPopUp({ otherUser, cancelHandler }) {
      return (
        <div className="inviteAuser-popup">
          <div className="inviteAuser-popup-content">
            <span className="close-button" onClick={() => cancelHandler(otherUser)}>X</span>
            <h2>Inviting {otherUser} for a game</h2>
            <Button variant="contained" color="primary" onClick={() => cancelHandler(otherUser)}>
              Cancel Invitation</Button>
          </div>
        </div>
      );
  }
    
  //################################################################
    // The PopUp for the game invite RECEIVE INVITE
    function RcvInvitePopup({ invitingUser, acceptHandler, cancelHandler }) {
      return (
        <div className="rcvInvite-popup">
          <div className="rcvInvite-popup-content">
            <span className="close-button" onClick={cancelHandler}>X</span>
            <h2>Incoming Game Invitation from: {invitingUser}</h2>        
            <Button variant="contained" color="primary" onClick={acceptHandler}>
              Accept</Button>
            <Button variant="contained" color="primary" onClick={cancelHandler}>
              Reject</Button>
          </div>
        </div>
      );
  }

  // the default view: 
  return (
    <Grid container spacing={2} justifyContent="center" style={{ margin: '20px 0', overflow: 'hidden' }}>
      <Grid item xs={6} sm={3}>
        <Button variant="contained" color="primary" onClick={() => setShowChampsPopup(true)}>
          Champions </Button>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Button variant="contained" color="primary" onClick={handlePlayNow}>
          Play Now </Button>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Button variant="contained" color="primary" onClick={logOut}>
          Log Out </Button>
      </Grid>
      {<StatsData currUser={currUser}/>}

      {ShowChampsPopup && <ChampsData handleClose={handleCloseChampsPopup} />}
      
      { ShowListOfAvailableUsers && 
        (<div className="listOnlineUsers-popup">
          <div className="listOnlineUsers-popup-content">
            <span className="close-button" onClick={() =>setShowListOfAvailableUsers(false)}>X</span>
            <h2>Logged-In Users</h2>
            <ul className='ulListLoggedInButtons'>
              {loggedInUsers.map((user, index) => (
                <li className='liListLoggedInButtons' key={user.nickname}> 
                  <button 
                    className="user-button" 
                    onClick={() => sendInitiateGameInvitation(user.nickname)}                    
                    >
                  {user.nickname} - Wins: {user.totalWins}
                  </button>
                </li>
              ))}
            </ul>

            {waitingInviteResponseFromUser && <InviteAuserPopUp          
              otherUser={invitedUser} 
              cancelHandler={() => cancelOutgoingGameInvite(invitedUser)} 
            />}

          </div>
        </div>
      )}

      {MultiPlayerGame && <TicTacToeMulti gameID={MultiPlayerGameID} user1inviting={MultiPlayerUser1nick} user2accepted={MultiPlayerUser2nick} user1FirstBoolFl={MultiPlayerUser1first} currUserIsU1={MultCurrUserIsU1} socketFromParent={socket} partnerSock={MultiPlayerPartnerSocket} closeGame={closeGameClickHandler} />}

      {pendingInviteAnswerToUser && <RcvInvitePopup
        invitingUser={pendingInviteAnswerToUserNickname} 
        acceptHandler={sendResponseAccept} 
        cancelHandler={sendResponseReject} 
      />}
      
    </Grid>
  );
}

export default UserView;