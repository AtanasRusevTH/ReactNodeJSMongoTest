// multiplGame.js
import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
// import { InviteAuserPopUp, RcvInvitePopup } from './initiateInviteSequence'; 
import './multiplGame.css'; 
import './TicTacToe'

function MultiplayerGame({ thisUser, onClose, socketFromParent, emitGetLoggedInUsers }) {
  const [loggedInUsers, setLoggedInUsers] = useState([]);  
  const [availForDualPlGame, setAvailForDualPlGame] = useState(false);  

  const [waitingResponseFromUser, setWaitingResponseFromUser] = useState(false);
  const [invitedUser, setInvitedUser] = useState('');

  const [waitingAnswerToUser, setWaitingAnswerToUser] = useState(false);

  const setupSocketListeners = () => {
    console.log("Setting up Socket listeners!");
    // events to be sent:
    // reportUser
    // getLoggedInUsers
    // user1invites2
    // user1cancelInviteTo2
    // user2acceptGame
    // user2cancelGame

    socketFromParent.emit('reportUser', {nickname: thisUser});

    socketFromParent.on('loggedInUsers', handleLoggedInUsers);

    // General Error upon registering on WebSocket!
    socketFromParent.on('reportUserNotFound', handleReportUserNotFound);

    socketFromParent.on('invitationByUser1', handleInvitationByUser1);
    socketFromParent.on('invitationByUser1Cancel', handleInvitationByUser1Cancel);
    
    socketFromParent.on('serverErrorUponInvitation', handleServerErrorUponInvitation);
    socketFromParent.on('invitationByUser1User2NotFree', handleInvitationByUser1User2NotFree);

    socketFromParent.on('user2AcceptedInvitation', handleUser2AcceptedInvitation);
    socketFromParent.on('user2CancelledInvitation', handleUser2CancelledInvitation);

    socketFromParent.on('error', handleError);
  };

//################################################################

  // Handler for 'loggedInUsers' event
  const handleLoggedInUsers = (data) => {
    console.log('Received loggedIn users:', data);

    // Find and remove the current user from the list
    const currentUserIndex = data.findIndex(user => user.nickname === thisUser);
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
    console.log(`${thisUser} wants to play with: `, toNickname);
    socketFromParent.emit('user1invites2', { sender: thisUser, receiver: toNickname });
    setWaitingResponseFromUser(true);
  };

  // SEND 'user1cancelInviteTo2'
  const cancelOutgoingGameInvite = (toNickname) => {
    console.log('Cancelling game invite to ', toNickname);
    socketFromParent.emit('user1cancelInviteTo2', { sender: thisUser, receiver: toNickname });
    setWaitingResponseFromUser(false);
  };

  // INCOMING

  // Handler for 'user2AcceptedInvitation' event
  const handleUser2AcceptedInvitation = ({ receiver }) => {
    console.log(`Your game invite was accepted by ${receiver}`);
    // TODO: Transition to game view
  };

  // Handler for 'serverErrorUponInvitation'
  const handleServerErrorUponInvitation = ({ receiver }) => {
    console.log(`Server Error upon invite to ${receiver}`);
    // TODO: Info Message Server Error
  };

  // Handler for 'invitationByUser1User2NotFree'
  const handleInvitationByUser1User2NotFree = ({ receiver }) => {
    console.log(`User ${receiver} not available for a game`);
    // TODO: Info message
  };
  
  // Handler for 'user2CancelledInvitation' event
  const handleUser2CancelledInvitation = ({ receiver }) => {
    console.log(`Your game invite was rejected by ${receiver}`);
    setWaitingAnswerToUser(false);
    // TODO: Handle notification of rejection
  };

  // SEND Game Invitation LOGIC END

//################################################################
  // RECEIVE Game Invitation LOGIC
  
  // INCOMING
  // handle 'invitationByUser1'
  const handleInvitationByUser1 = ({ sender, receiver }) => {
    console.log(`${receiver} Received game invite from ${sender}`);
    // TODO: Handle showing invite acceptance dialog
    setWaitingAnswerToUser(true);
  };

  // Handler for 'invitationByUser1Cancel' event
  const handleInvitationByUser1Cancel = ({ sender }) => {
    console.log(`Game invite cancelled by ${thisUser}`);
    setWaitingAnswerToUser(false);
    // TODO: Close dialog showing waiting for response
  };

  // OUTGOING
  // SEND 'user2acceptGame'
  const sendResponseAccept = ({ requestedUser }) => {
    console.log(`Your game invite was accepted by ${requestedUser}`);
    // TODO: Transition to game view
  };

  // SEND 'user2cancelGame'
  const sendResponseReject = ({ requestedUser }) => {
    console.log(`Your game invite was rejected by ${requestedUser}`);
    setWaitingResponseFromUser(false);
    // TODO: Handle notification of rejection
  };

  // RECEIVE Game Invitation LOGIC END
//################################################################

  // Additional handlers:
  const handleReportUserNotFound = (data) => {
    console.error('Error on the Server: Your user is not logged in! Contact Admin!', data.message);
    alert(`Error on the Server: Your user is not logged in! Contact Admin!: ${data.message}`);
  };
  // Handler for any errors received
  const handleError = (error) => {
    console.error('Error received from WebSocket Server:', error.message);
    alert(`WebSocket Error: ${error.message}`);
  };

//################################################################
  // React Hooks:

  useEffect(() => {
    if(socketFromParent.connected){
      setupSocketListeners();
    } else {
      console.log('ERROR in child component MultiplayerGame! Socket from parent not connected!');
      // alert('FATAL ERROR in child component MultiplayerGame! Socket from parent not connected!');
    }

    const handleReconnect = () => {
      console.log('Reconnected to WebSocket server.');
      setupSocketListeners();
    };

    socketFromParent.on('connect', handleReconnect);
    
    // Add event listener for keyboard events
    const handleKeyDown = (event) => {      
      if (event.key === 'Escape') {

        if(waitingResponseFromUser) {
          cancelOutgoingGameInvite(invitedUser);
        } else if(waitingAnswerToUser) {
         handleUser2CancelledInvitation();
        } else {
          closeAndCleanup();
        }

      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Unsubscribe from all socket events on cleanup to prevent memory leaks
      socketFromParent.off('connect', handleReconnect);
      removeSocketListeners();
    };
  }, [socketFromParent]);
  
  const removeSocketListeners = () => {
    socketFromParent.off('loggedInUsers', handleLoggedInUsers);
    socketFromParent.off('reportUserNotFound', handleReportUserNotFound);
    socketFromParent.off('invitationByUser1', handleInvitationByUser1);
    socketFromParent.off('invitationByUser1Cancel', handleInvitationByUser1Cancel);
    socketFromParent.off('serverErrorUponInvitation', handleServerErrorUponInvitation);
    socketFromParent.off('invitationByUser1User2NotFree', handleInvitationByUser1User2NotFree);
    socketFromParent.off('user2AcceptedInvitation', handleUser2AcceptedInvitation);
    socketFromParent.off('user2CancelledInvitation', handleUser2CancelledInvitation);
    socketFromParent.off('error', handleError);
  };

  const closeAndCleanup = () => {
    onClose();
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

//################################################################
  // Component JSX Logic

  // Render the pop-up with the list of logged-in users
  return (
    <div className="listOnlineUsers-popup">
      <div className="listOnlineUsers-popup-content">
        <span className="close-button" onClick={closeAndCleanup}>X</span>
        <h2>Logged-In Users</h2>
        <ul className='ulListLoggedInButtons'>
          {loggedInUsers.map((user, index) => (
            <li className='liListLoggedInButtons' key={user.nickname}> 
              <button 
                className="user-button" 
                onClick={() => sendInitiateGameInvitation(user.nickname)}
                disabled={waitingResponseFromUser}
                >
              {user.nickname} - Wins: {user.totalWins}
              </button>
            </li>
          ))}
        </ul>

        {waitingResponseFromUser && <InviteAuserPopUp          
          otherUser={invitedUser} 
          cancelHandler={() => cancelOutgoingGameInvite(invitedUser)} 
        />}

        {waitingAnswerToUser && <RcvInvitePopup
          invitingUser={thisUser} 
          acceptHandler={handleUser2AcceptedInvitation} 
          cancelHandler={handleUser2CancelledInvitation} 
        />}
        
      </div>
    </div>
  );
}

export default MultiplayerGame;