// multiplGame.js
import React, { useState, useEffect } from 'react';
import './multiplGame.css'; 

export function InviteAuserPopUp({ invitingUser, otherUser, cancelHandler}) {
  // , socketToThis }) {
/*  const [loggedInUsers, setLoggedInUsers] = useState([]);  
  const [availForDualPlGame, setAvailForDualPlGame] = useState(false);  
  const [waitingResponseFromUser, setWaitingResponseFromUser] = useState(false);
  const [waitingAnswerToUser, setWaitingAnswerToUser] = useState(false);

  const setupSocketListeners = () => {
    socketToThis.emit('getLoggedInUsers');

    socketToThis.on('loggedInUsers', handleLoggedInUsers);
    // events to be sent: 
    // reportUser
    // getLoggedInUsers
    // user1invites2
    // user1cancelInviteTo2
    // user2acceptGame
    // user2cancelGame

    socketToThis.on('reportUserNotFound', handleReportUserNotFound);
    socketToThis.on('serverErrorUponInvitation', handleServerErrorUponInvitation);
    socketToThis.on('invitationByUser1User2NotFree', handleInvitationByUser1User2NotFree);

    socketToThis.on('invitationByUser1', handleInvitationByUser1);
    socketToThis.on('invitationByUser1Cancel', handleInvitationByUser1Cancel);
    socketToThis.on('user2AcceptedInvitation', handleUser2AcceptedInvitation);
    socketToThis.on('user2CancelledInvitation', handleUser2CancelledInvitation);
    socketToThis.on('error', handleError);
  };

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

  //#########################################
  // SEND Game Invitation LOGIC
  //#########################################
  
  const initiateGameInvitation = (toNickname) => {
    // onUserSelect(nickname);
    console.log(`${thisUser} wants to play with: `, toNickname);
    socketToThis.emit('invitationByUser1', { sender: thisUser, receiver: toNickname });
    setWaitingResponseFromUser(true);
  };

  const cancelGameInvite = (toNickname) => {
    console.log('Cancelling game invite to ', toNickname);
    socketToThis.emit('cancelGameInvite', { sender: thisUser, receiver: toNickname });
    setWaitingResponseFromUser(false);
    // Close any modal showing waiting for response
  };


  const handleSendGameInvite = ({ requestedUser }) => {
    console.log(`${thisUser} sent game invite to ${requestedUser}`);
    // TODO: Handle showing invite acceptance dialog
    setWaitingResponseFromUser(true);
  };

  // Handler for 'cancelGameInviteNotification' event
  const handleCancelSendGameInvite = ({ requestedUser }) => {
    console.log(`${thisUser} Game invite to ${requestedUser} cancelled`);
    setWaitingResponseFromUser(false);
    // TODO: Close dialog showing waiting for response
  };

  // Handler for 'gameInviteAccepted' event
  const handleGameInviteToAccepted = ({ requestedUser }) => {
    console.log(`Your game invite was accepted by ${requestedUser}`);
    // TODO: Transition to game view
  };

  // Handler for 'gameInviteRejected' event
  const handleGameInviteToRejected = ({ requestedUser }) => {
    console.log(`Your game invite was rejected by ${requestedUser}`);
    setWaitingResponseFromUser(false);
    // TODO: Handle notification of rejection
  };

  //#########################################
  // SEND Game Invitation LOGIC END
  //#########################################

  //#########################################
  // RECEIVE Game Invitation LOGIC
  //#########################################
  
  const handleInvitationByUser1 = ({ sender }) => {
    console.log(`Received game invite from ${sender}`);
    // TODO: Handle showing invite acceptance dialog
    setWaitingAnswerToUser(true);
  };

  // Handler for 'cancelGameInviteNotification' event
  const handleInvitationByUser1Cancel = ({ sender }) => {
    console.log(`Game invite cancelled by ${thisUser}`);
    setWaitingAnswerToUser(false);
    // TODO: Close dialog showing waiting for response
  };

  // Handler for 'gameInviteAccepted' event
  const handleUser2AcceptedInvitation = ({ receiver }) => {
    console.log(`Your game invite was accepted by ${receiver}`);
    // TODO: Transition to game view
  };

  // Handler for 'gameInviteRejected' event
  const handleUser2CancelledInvitation = ({ receiver }) => {
    console.log(`Your game invite was rejected by ${receiver}`);
    setWaitingAnswerToUser(false);
    // TODO: Handle notification of rejection
  };

  //#########################################
  // RECEIVE Game Invitation LOGIC END
  //#########################################



  // Handler for any errors received
  const handleError = (error) => {
    console.error('Error received from socket:', error.message);
    alert(`WebSocket Error: ${error.message}`);
  };

  useEffect(() => {
    if(socketToThis.connected){
      setupSocketListeners();
    } else {
      console.log('FATAL ERROR in child component MultiplayerGame! Socket from parent not connected!');
      alert('FATAL ERROR in child component MultiplayerGame! Socket from parent not connected!');
    }

    const handleReconnect = () => {
      console.log('Reconnected to WebSocket server.');
      setupSocketListeners();
    };

    socketToThis.on('connect', handleReconnect);
    
    // Add event listener for keyboard events
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAndCleanup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Unsubscribe from all socket events on cleanup to prevent memory leaks
      socketToThis.off('connect', handleReconnect);
      removeSocketListeners();
    };
  }, [socketToThis]);
  
  const removeSocketListeners = () => {
    socketToThis.off('loggedInUsers', handleLoggedInUsers);
    socketToThis.off('receiveGameInvite', handleInvitationByUser1);
    socketToThis.off('cancelGameInviteNotification', handleInvitationByUser1Cancel);
    socketToThis.off('gameInviteAccepted', handleUser2AcceptedInvitation);
    socketToThis.off('gameInviteRejected', handleUser2CancelledInvitation);
    socketToThis.off('error', handleError);
  };

  const closeAndCleanup = () => {
    onClose();
  };
*/
  // Render the pop-up with the list of logged-in users
  return (
    <div className="listOnlineUsers-popup">
      <div className="listOnlineUsers-popup-content">
        <span className="close-button" onClick={cancelHandler}>X</span>
        <h2>Inviting {otherUser} for a game</h2>
      </div>
    </div>
  );
}

export function RcvInvitePopup({ invitingUser, acceptHandler, cancelHandler}){
  return (
    <div className="listOnlineUsers-popup">
      <div className="listOnlineUsers-popup-content">
        <span className="close-button" onClick={cancelHandler}>X</span>
        <h2>Incoming Game Invitation from: {invitingUser}</h2>        
        <Button variant="contained" color="primary" onClick={cancelHandler}>
          Accept</Button>
        <Button variant="contained" color="primary" onClick={acceptHandler}>
          Reject</Button>
      </div>
    </div>
  );
}