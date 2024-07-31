// frontend.js
import TicTacToe1 from './TicTacToe1'
import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import LoginAndReg from './login'
import UserView from './userView'

export default function TicTacToePage() {
  // state variables
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currUser, setCurrUser] = useState('');
  const [showSimpleGame, setshowSimpleGame] = useState(true);
    
  useEffect(() => {
    const nickFromCookie = Cookies.get('userName');

    const checkUserLoggedIn = async (currUserNick) => {
      try {
          const response = await fetch('https://103.13.210.25:5000/api/auth/loginCheck', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ nickname: currUserNick})
          });
  
          if (response.ok) {
            setCurrUser(currUserNick);
            console.log("SESSION: Logged In as user: ", currUserNick)    
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setCurrUser('');
            setshowSimpleGame(true); // explicit failsafe flag setting
          }
      } catch (error) {
          console.error('loginCheck Nickname SESSION check failed:', error);
          alert('loginCheck Nickname SESSION Failed to check name in databse. Please LogIn again.');
      }

      
    }
    checkUserLoggedIn(nickFromCookie);
  }, []);
  

  const handleLogin = (user) => {
    setCurrUser(user);
    console.log("Logged In current user: ", user)    
    setIsLoggedIn(true);
    Cookies.set('userName', user, { expires: 7 }); // expires in 7 days
  };

  const handleLogOut = async () => {
    console.log("Logged Out current user: ", currUser)
    setIsLoggedIn(false);
    setCurrUser({});
    setshowSimpleGame(true); // explicit failsafe flag setting
    Cookies.remove('userName'); // Remove session cookie
  };

  const handleSimpleGameShow = (state) => {
    setshowSimpleGame(state);
  }

  // writing the proper logic for login and logout

  return (
    // JSXml
    <div>
      <h1>Tic Tac Toe Game</h1>
        {isLoggedIn ? (
            <div>
            <UserView currUser={currUser} onLogOut={handleLogOut} hideSimpleGame={handleSimpleGameShow}/>
            </div> 
          ) : (
            <div>
            <LoginAndReg onLogin={handleLogin}/>                
            </div>
          )
        }
        {showSimpleGame && <TicTacToe1 /> }      
    </div>
  );
}