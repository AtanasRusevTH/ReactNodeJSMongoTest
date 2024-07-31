// gameInvite.js
import React from 'react';
import './gameInvite.css'; 

function GameInviteSendDialog ({toUser, onCancel}) {

  return (
    <div className="gameInviteSend-popup">
      <div className="gameInviteSend-popup-content">
        <h2>Inviting {toUser}</h2>
          <button 
            className="cancelButton" 
            onClick={onCancel}>
              Cancel request
          </button>            
      </div>      
    </div>
  )
}

function GameInviteReceiveDialog ({fromUser, onReject, onAccept}) {
 
  return (
    <div className="gameInviteSend-popup">
      <div className="gameInviteSend-popup-content">
        <h2>{fromUser} invites you for a game</h2>
          <button 
            className="cancelButton" 
            onClick={onReject}> Reject 
          </button>
          <button 
            className="confirmButton" 
            onClick={onAccept}> Accept
          </button>
      </div>      
    </div>
  )
}

export { GameInviteReceiveDialog, GameInviteSendDialog };